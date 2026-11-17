import { normalizeMessage } from './normalize';
import type { LiveEvent } from './normalize';
import { profileFor } from './profiles';
import type { DeviceProfile } from './profiles';

export interface MidiDevice {
  id: string;
  name: string;
  manufacturer: string;
  connected: boolean;
  profile: DeviceProfile;
}

export type MidiAccessError = 'unsupported' | 'denied' | 'failed';

/** Safari (macOS e iOS) no tiene Web MIDI (BUGS B-006). */
export function isWebMidiSupported(): boolean {
  return typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;
}

/**
 * Entrada de teclado por Web MIDI. Pide permiso solo cuando el usuario lo decide
 * (VERIFICACIONES §7) y sigue conexiones y desconexiones en caliente.
 */
export class WebMidiInput {
  private listeners = new Set<(devices: MidiDevice[]) => void>();
  private current: MIDIInput | null = null;
  private handler: ((e: LiveEvent) => void) | null = null;

  private constructor(private readonly access: MIDIAccess) {
    access.onstatechange = () => {
      // Si el teclado conectado se desconecta, se suelta sin colgarse.
      if (this.current && this.current.state === 'disconnected') this.disconnect();
      const devices = this.devices();
      for (const l of this.listeners) l(devices);
    };
  }

  static async request(): Promise<WebMidiInput> {
    if (!isWebMidiSupported()) throw new WebMidiError('unsupported');
    try {
      return new WebMidiInput(await navigator.requestMIDIAccess({ sysex: false }));
    } catch (e) {
      const denied = e instanceof DOMException && e.name === 'SecurityError';
      throw new WebMidiError(denied ? 'denied' : 'failed');
    }
  }

  devices(): MidiDevice[] {
    return [...this.access.inputs.values()].map((input) => ({
      id: input.id,
      name: input.name ?? 'Teclado MIDI',
      manufacturer: input.manufacturer ?? '',
      connected: input.state === 'connected',
      profile: profileFor(input.name ?? '', input.manufacturer ?? ''),
    }));
  }

  onDevicesChange(listener: (devices: MidiDevice[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  get connectedId(): string | null {
    return this.current?.id ?? null;
  }

  connect(id: string, onEvent: (e: LiveEvent) => void): MidiDevice | null {
    this.disconnect();
    const input = this.access.inputs.get(id);
    if (!input) return null;
    const device = this.devices().find((d) => d.id === id) ?? null;
    const profile = device?.profile;
    this.handler = onEvent;
    input.onmidimessage = (msg: MIDIMessageEvent) => {
      if (!msg.data) return;
      const event = normalizeMessage(msg.data, msg.timeStamp, profile);
      if (!event) return;
      if (profile?.channel !== undefined && event.channel !== profile.channel) return;
      this.handler?.(event);
    };
    this.current = input;
    return device;
  }

  disconnect(): void {
    if (this.current) this.current.onmidimessage = null;
    this.current = null;
    this.handler = null;
  }
}

export class WebMidiError extends Error {
  constructor(readonly reason: MidiAccessError) {
    super(reason);
  }
}
