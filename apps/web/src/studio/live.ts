import { Recorder, WebMidiError, WebMidiInput, isWebMidiSupported } from '@impromptu/midi';
import type { LiveEvent, MidiAccessError, MidiDevice } from '@impromptu/midi';
import { KEYBOARD_PRESETS, createNoteEvent } from '@impromptu/core';
import type { KeyboardRange, NoteEvent, PedalEvent, Take } from '@impromptu/core';
import { create } from 'zustand';
import { engine } from './audio';
import { startCameraRecording, stopCameraRecording, useCamera } from './camera';
import { saveMedia } from './mediaStore';
import { transport, useStudio } from './store';
import { listTakes, saveTake } from './takesDb';
import type { TakeSummary } from './takesDb';

export type MidiStatus = 'off' | 'asking' | 'ready' | MidiAccessError;

interface LiveState {
  status: MidiStatus;
  devices: MidiDevice[];
  device: MidiDevice | null;
  recording: boolean;
  takes: TakeSummary[];
  /** Valor actual del sustain (0–127), para el indicador de pedal. */
  sustain: number;
}

export const useLive = create<LiveState>(() => ({
  status: isWebMidiSupported() ? 'off' : 'unsupported',
  devices: [],
  device: null,
  recording: false,
  takes: [],
  sustain: 0,
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
  private wakeLock: WakeLockSentinel | null = null;

  /** La pantalla no se apaga mientras se graba (BUGS B-017). */
  private async keepScreenOn(on: boolean): Promise<void> {
    try {
      if (on && 'wakeLock' in navigator) this.wakeLock = await navigator.wakeLock.request('screen');
      if (!on) {
        await this.wakeLock?.release();
        this.wakeLock = null;
      }
    } catch {
      // Sin Wake Lock (navegador o batería baja): se graba igual.
    }
  }

  /** El usuario pidió conectar: se pide permiso y se conecta el primer teclado. */
  async connect(): Promise<void> {
    if (useLive.getState().status === 'asking') return;
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

  /** Si el permiso MIDI ya se dio antes, conecta sin preguntar (al abrir o recargar la app). */
  async autoConnect(): Promise<void> {
    if (useLive.getState().status !== 'off') return;
    try {
      const permission = await navigator.permissions?.query({ name: 'midi' as PermissionName });
      if (permission?.state === 'granted') await this.connect();
    } catch {
      // El navegador no deja consultar el permiso: el usuario conecta con el botón.
    }
  }

  /** Suelta el teclado y apaga lo que suene (al recargar este módulo en desarrollo). */
  dispose(): void {
    this.input?.disconnect();
    engine.live?.reset();
  }

  choose(id: string): void {
    const device = this.input?.connect(id, (e) => this.onEvent(e)) ?? null;
    useLive.setState({ device });
    if (device) useStudio.getState().setView('live');
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
    // Tocar sin estar reproduciendo lleva a la vista en vivo (y ahí se queda).
    if (e.type === 'noteon' && !transport.playing && useStudio.getState().view !== 'live') {
      useStudio.getState().setView('live');
    }
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
        if (e.kind === 'sustain') useLive.setState({ sustain: e.value });
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
    startCameraRecording();
    useStudio.getState().setView('live');
    void this.keepScreenOn(true);
    useLive.setState({ recording: true });
  }

  /** Segundos grabados hasta ahora (para el LCD). */
  elapsed(): number {
    return useLive.getState().recording ? liveNow() - this.recordStart : 0;
  }

  async stopRecording(): Promise<Take | null> {
    if (!useLive.getState().recording) return null;
    useLive.setState({ recording: false });
    void this.keepScreenOn(false);
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
    const camera = await stopCameraRecording();
    if (take.tracks.every((t) => t.notes.length === 0)) return null;
    if (camera) {
      const key = `${take.id}.${camera.file.type.includes('mp4') ? 'mp4' : 'webm'}`;
      await saveMedia(camera.file, key);
      const calibration = useCamera.getState().calibration;
      take.media.push({
        kind: 'video',
        storageKey: key,
        // Segundo de la toma en que empezó la cámara (mismo reloj: performance.now).
        offset: Math.round((camera.startedAt - this.recordStart) * 1000) / 1000,
        ...(calibration ? { calibration } : {}),
      });
    }
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

// Desarrollo: al recargar este módulo, la conexión vieja se cierra para que no quede
// sonando un teclado "fantasma" mientras la interfaz pide conectar de nuevo.
import.meta.hot?.dispose(() => live.dispose());
