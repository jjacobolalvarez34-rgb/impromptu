import { Recorder, WebMidiError, WebMidiInput, isWebMidiSupported } from '@impromptu/midi';
import type { LiveEvent, MidiAccessError, MidiDevice } from '@impromptu/midi';
import { KEYBOARD_PRESETS, createNoteEvent } from '@impromptu/core';
import type { KeyboardRange, NoteEvent, PedalEvent, Take } from '@impromptu/core';
import { create } from 'zustand';
import { engine } from './audio';
import { listTakes, saveTake } from './takesDb';
import type { TakeSummary } from './takesDb';

export type MidiStatus = 'off' | 'asking' | 'ready' | MidiAccessError;

interface LiveState {
  status: MidiStatus;
  devices: MidiDevice[];
  device: MidiDevice | null;
  recording: boolean;
  takes: TakeSummary[];
}

export const useLive = create<LiveState>(() => ({
  status: isWebMidiSupported() ? 'off' : 'unsupported',
  devices: [],
  device: null,
  recording: false,
  takes: [],
}));

/** Reloj en vivo: el mismo de MIDIMessageEvent.timeStamp (BUGS B-007). */
export const liveNow = () => performance.now() / 1000;

/** Segundos de historia que se dibujan subiendo (lo que cabe en pantalla con margen). */
const KEEP = 12;

/**
 * Sesión en vivo: recibe el teclado, hace sonar el piano, guarda lo reciente para el
 * visualizador y, si se está grabando, arma la toma.
 */
class LiveSession {
  private input: WebMidiInput | null = null;
  private recorder = new Recorder();
  /** Notas recientes en orden de inicio; las que siguen abajo tienen end = Infinity. */
  readonly notes: NoteEvent[] = [];
  readonly pedals: PedalEvent[] = [];
  private readonly open = new Map<number, NoteEvent>();
  lastActivity = -Infinity;
  private recordStart = 0;

  /** El usuario pidió conectar: se pide permiso y se conecta el primer teclado. */
  async connect(): Promise<void> {
    void engine.start(); // el clic también permite crear el audio (B-008)
    useLive.setState({ status: 'asking' });
    try {
      this.input ??= await WebMidiInput.request();
    } catch (e) {
      useLive.setState({ status: e instanceof WebMidiError ? e.reason : 'failed' });
      return;
    }
    this.input.onDevicesChange((devices) => this.onDevices(devices));
    useLive.setState({ status: 'ready' });
    this.onDevices(this.input.devices());
  }

  choose(id: string): void {
    const device = this.input?.connect(id, (e) => this.onEvent(e)) ?? null;
    useLive.setState({ device });
  }

  private onDevices(devices: MidiDevice[]): void {
    const current = useLive.getState().device;
    const stillThere = current && devices.some((d) => d.id === current.id && d.connected);
    useLive.setState({ devices });
    if (stillThere) return;
    if (current) this.lost();
    const next =
      devices.find((d) => d.connected && d.profile.id !== 'generic') ??
      devices.find((d) => d.connected);
    if (next) this.choose(next.id);
  }

  /** El teclado se desconectó: se cierran notas y, si se grababa, se guarda lo que había. */
  private lost(): void {
    engine.live?.reset();
    for (const n of this.open.values()) n.end = liveNow();
    this.open.clear();
    useLive.setState({ device: null });
    if (useLive.getState().recording) void this.stopRecording();
  }

  private onEvent(e: LiveEvent): void {
    this.lastActivity = e.time;
    if (useLive.getState().recording) this.recorder.push(e);
    switch (e.type) {
      case 'noteon': {
        engine.live?.noteOn(e.pitch, e.velocity);
        const prev = this.open.get(e.pitch);
        if (prev) prev.end = e.time;
        const note = createNoteEvent({
          pitch: e.pitch,
          start: e.time,
          end: Infinity,
          velocity: e.velocity,
          origin: 'midi-live',
        });
        this.notes.push(note);
        this.open.set(e.pitch, note);
        break;
      }
      case 'noteoff': {
        engine.live?.noteOff(e.pitch);
        const note = this.open.get(e.pitch);
        if (note) note.end = e.time;
        this.open.delete(e.pitch);
        break;
      }
      case 'pedal':
        engine.live?.pedal(e.kind, e.value);
        this.pedals.push({ kind: e.kind, time: e.time, value: e.value });
        break;
    }
    this.prune(e.time);
  }

  private prune(now: number): void {
    let drop = 0;
    while (drop < this.notes.length && this.notes[drop]!.end < now - KEEP) drop++;
    if (drop > 0) this.notes.splice(0, drop);
    // Del pedal se conserva el último valor de cada tipo anterior a la ventana.
    while (this.pedals.length > 64 && this.pedals[0]!.time < now - KEEP) this.pedals.shift();
  }

  /** ¿Hay que mostrar el modo en vivo? Si se graba, si algo suena o si se tocó hace poco. */
  active(now: number): boolean {
    return useLive.getState().recording || this.open.size > 0 || now - this.lastActivity < 4;
  }

  range(): KeyboardRange {
    return useLive.getState().device?.profile.range ?? KEYBOARD_PRESETS[88];
  }

  startRecording(): void {
    this.recordStart = liveNow();
    this.recorder.start(this.recordStart);
    useLive.setState({ recording: true });
  }

  /** Segundos grabados hasta ahora (para el LCD). */
  elapsed(): number {
    return useLive.getState().recording ? liveNow() - this.recordStart : 0;
  }

  async stopRecording(): Promise<Take | null> {
    if (!useLive.getState().recording) return null;
    useLive.setState({ recording: false });
    const device = useLive.getState().device;
    const count = useLive.getState().takes.length + 1;
    const take = this.recorder.stop(
      liveNow(),
      `Toma ${count}`,
      device
        ? {
            name: device.name,
            ...(device.manufacturer ? { manufacturer: device.manufacturer } : {}),
          }
        : undefined,
    );
    if (take.tracks.every((t) => t.notes.length === 0)) return null;
    await saveTake(take);
    await refreshTakes();
    return take;
  }
}

export async function refreshTakes(): Promise<void> {
  try {
    useLive.setState({ takes: await listTakes() });
  } catch {
    // Sin IndexedDB (ventana privada muy restringida): la lista queda vacía.
  }
}

export const live = new LiveSession();
