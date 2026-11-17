import { registerPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';

/**
 * Relleno de Web MIDI para la app de Android de prueba (ADR-018): la vista web de Android no
 * trae navigator.requestMIDIAccess, así que se arma uno con el puente nativo `ImpromptuMidi`
 * (apps/mobile). El resto de la app (packages/midi) no cambia.
 */
interface NativeDevice {
  id: string;
  name: string;
  manufacturer: string;
}

interface ImpromptuMidiPlugin {
  devices(): Promise<{ available: boolean; devices: NativeDevice[] }>;
  open(options: { id: string }): Promise<void>;
  close(): Promise<void>;
  addListener(
    event: 'devices',
    listener: (e: { devices: NativeDevice[] }) => void,
  ): Promise<PluginListenerHandle>;
  addListener(
    event: 'message',
    listener: (e: { id: string; data: number[] }) => void,
  ): Promise<PluginListenerHandle>;
}

const Midi = registerPlugin<ImpromptuMidiPlugin>('ImpromptuMidi');

type MessageHandler = ((e: { data: Uint8Array; timeStamp: number }) => void) | null;

/**
 * Separa un paquete de bytes en mensajes MIDI completos (con estado continuo). Los mensajes
 * de sistema exclusivo se descartan; los de tiempo real (un byte) pasan solos.
 */
export function splitMidi(bytes: readonly number[], running: { status: number }): number[][] {
  const out: number[][] = [];
  let i = 0;
  while (i < bytes.length) {
    const b = bytes[i]!;
    if (b >= 0xf8) {
      out.push([b]);
      i++;
      continue;
    }
    if (b === 0xf0) {
      while (i < bytes.length && bytes[i] !== 0xf7) i++;
      i++;
      continue;
    }
    let status = running.status;
    if (b >= 0x80) {
      status = b;
      running.status = b < 0xf0 ? b : 0;
      i++;
    }
    if (status < 0x80) {
      i++;
      continue;
    }
    const kind = status & 0xf0;
    const length = kind === 0xc0 || kind === 0xd0 ? 1 : 2;
    if (i + length > bytes.length) break;
    out.push([status, ...bytes.slice(i, i + length)]);
    i += length;
  }
  return out;
}

class NativeInput {
  readonly type = 'input';
  state: 'connected' | 'disconnected' = 'connected';
  readonly connection = 'open';
  private handler: MessageHandler = null;
  readonly running = { status: 0 };

  constructor(
    readonly id: string,
    readonly name: string,
    readonly manufacturer: string,
  ) {}

  get onmidimessage(): MessageHandler {
    return this.handler;
  }

  /** Igual que en Web MIDI: poner un manejador abre el puerto; quitarlo lo cierra. */
  set onmidimessage(handler: MessageHandler) {
    this.handler = handler;
    if (handler) void Midi.open({ id: this.id });
    else void Midi.close();
  }

  deliver(bytes: number[]): void {
    const handler = this.handler;
    if (!handler) return;
    const timeStamp = performance.now();
    for (const msg of splitMidi(bytes, this.running)) {
      handler({ data: Uint8Array.from(msg), timeStamp });
    }
  }
}

class NativeAccess {
  readonly inputs = new Map<string, NativeInput>();
  readonly outputs = new Map<string, never>();
  readonly sysexEnabled = false;
  onstatechange: (() => void) | null = null;

  refresh(devices: readonly NativeDevice[]): void {
    const ids = new Set(devices.map((d) => d.id));
    for (const [id, input] of this.inputs) {
      if (!ids.has(id)) {
        input.state = 'disconnected';
        this.inputs.delete(id);
      }
    }
    for (const d of devices) {
      if (!this.inputs.has(d.id))
        this.inputs.set(d.id, new NativeInput(d.id, d.name, d.manufacturer));
    }
    this.onstatechange?.();
  }
}

/** Instala el relleno si la vista web no trae Web MIDI. */
export function installNativeMidi(): void {
  if ('requestMIDIAccess' in navigator) return;
  let access: Promise<NativeAccess> | null = null;
  const request = () => {
    access ??= (async () => {
      const a = new NativeAccess();
      const { available, devices } = await Midi.devices();
      if (!available) throw new DOMException('Este celular no tiene MIDI', 'NotSupportedError');
      a.refresh(devices);
      await Midi.addListener('devices', (e) => a.refresh(e.devices));
      await Midi.addListener('message', (e) => a.inputs.get(e.id)?.deliver(e.data));
      return a;
    })();
    return access;
  };
  Object.defineProperty(navigator, 'requestMIDIAccess', { value: request, configurable: true });
}
