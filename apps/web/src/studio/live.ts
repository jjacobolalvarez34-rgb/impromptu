import { Recorder, WebMidiError, WebMidiInput, isWebMidiSupported } from '@impromptu/midi';
import type { LiveEvent, MidiAccessError, MidiDevice } from '@impromptu/midi';
import { KEYBOARD_PRESETS, createNoteEvent } from '@impromptu/core';
import type { KeyboardRange, NoteEvent, PedalEvent, Take } from '@impromptu/core';
import { create } from 'zustand';
import { engine } from './audio';
import { startCameraRecording, stopCameraRecording, useCamera } from './camera';
import { saveMedia } from './mediaStore';
import { Clicker, useMetronome } from './metronome';
import { setTakeEditedListener, transport, useStudio } from './store';
import { conInstrumento } from './Instrumento';
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
  /** Al grabar con el teclado, grabar también el sonido real con el micrófono. */
  recordMic: boolean;
  setRecordMic: (on: boolean) => void;
}

const RECORD_MIC_KEY = 'impromptu-grabar-microfono';
const readRecordMic = () => {
  try {
    return localStorage.getItem(RECORD_MIC_KEY) === '1';
  } catch {
    return false;
  }
};

export const useLive = create<LiveState>(() => ({
  status: isWebMidiSupported() ? 'off' : 'unsupported',
  devices: [],
  device: null,
  recording: false,
  takes: [],
  sustain: 0,
  recordMic: readRecordMic(),
  setRecordMic: (recordMic) => {
    useLive.setState({ recordMic });
    try {
      localStorage.setItem(RECORD_MIC_KEY, recordMic ? '1' : '0');
    } catch {
      // Sin almacenamiento: vale solo para esta sesión.
    }
  },
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
  /** Tutorial (modo espera): recibe cada tecla tocada. */
  onPractice: ((pitch: number) => void) | null = null;
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
    // Tocar sin estar reproduciendo lleva a la vista en vivo (y ahí se queda), salvo en el
    // tutorial: ahí la reproducción se detiene esperando la nota y la pieza debe seguir visible.
    if (
      e.type === 'noteon' &&
      !this.onPractice &&
      !transport.playing &&
      useStudio.getState().view !== 'live'
    ) {
      useStudio.getState().setView('live');
    }
    if (useLive.getState().recording) this.recorder.push(e);
    switch (e.type) {
      case 'noteon': {
        const instrumento = useStudio.getState().instrumento;
        if (instrumento === 'piano') engine.live?.noteOn(e.pitch, e.velocity);
        else engine.tocarOtro(instrumento, e.pitch, e.velocity);
        this.onPractice?.(e.pitch);
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
        const instrumento = useStudio.getState().instrumento;
        if (instrumento === 'piano') engine.live?.noteOff(e.pitch);
        else engine.soltarOtro(instrumento, e.pitch);
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

  /**
   * Notas escuchadas por el micrófono (en vivo, con ~1 s de retraso): suben como las del
   * teclado. Los tiempos van en el reloj en vivo (liveNow).
   */
  pushHeard(notes: { pitch: number; start: number; end: number; velocity: number }[]): void {
    for (const n of notes) {
      this.notes.push(createNoteEvent({ ...n, origin: 'audio' }));
    }
    this.notes.sort((a, b) => a.start - b.start);
    this.lastActivity = liveNow();
    if (!transport.playing && useStudio.getState().view !== 'live') {
      useStudio.getState().setView('live');
    }
    this.prune(liveNow());
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

  /** Grabación del micrófono que acompaña a la del teclado (si está activada). */
  private mic: {
    recorder: MediaRecorder;
    stream: MediaStream;
    chunks: Blob[];
    startedAt: number;
  } | null = null;

  private async startMic(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream);
      const mic = { recorder, stream, chunks, startedAt: liveNow() };
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      // El segundo 0 del audio es cuando el grabador arranca de verdad (mismo reloj que el MIDI).
      recorder.onstart = () => (mic.startedAt = liveNow());
      recorder.start(1000);
      this.mic = mic;
    } catch {
      // Sin permiso o sin micrófono: se graba solo el teclado.
      this.mic = null;
    }
  }

  private stopMic(): Promise<{ blob: Blob; startedAt: number } | null> {
    const mic = this.mic;
    this.mic = null;
    if (!mic || mic.recorder.state === 'inactive') return Promise.resolve(null);
    return new Promise((resolve) => {
      mic.recorder.onstop = () => {
        for (const t of mic.stream.getTracks()) t.stop();
        const blob = new Blob(mic.chunks, { type: mic.recorder.mimeType });
        resolve(blob.size > 0 ? { blob, startedAt: mic.startedAt } : null);
      };
      mic.recorder.requestData();
      mic.recorder.stop();
    });
  }

  private clicker = new Clicker();
  /** Tempo y compás del metrónomo de esta grabación (si estaba encendido). */
  private metronome: { bpm: number; beats: number } | null = null;

  startRecording(): void {
    const met = useMetronome.getState();
    if (met.on) {
      void engine.start();
      const context = engine.audioContext;
      const lead = 0.15;
      this.clicker.start(context, context.currentTime + lead, met.bpm, met.beats);
      // El primer clic, en el reloj en vivo (el del MIDI), contando la latencia de salida:
      // así el tempo de la toma coincide con lo que se oyó.
      this.recordStart = liveNow() + lead + (context.outputLatency || 0) + context.baseLatency;
      this.metronome = { bpm: met.bpm, beats: met.beats };
    } else {
      this.recordStart = liveNow();
      this.metronome = null;
    }
    this.recorder.start(this.recordStart);
    if (useLive.getState().recordMic) void this.startMic();
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
    const grabada = this.recorder.stop(
      liveNow(),
      `Toma ${count}`,
      device
        ? {
            name: device.name,
            ...(device.manufacturer ? { manufacturer: device.manufacturer } : {}),
          }
        : undefined,
    );
    // La toma queda con el instrumento elegido (guitarra: con cuerda y traste).
    const take = conInstrumento(grabada, useStudio.getState().instrumento);
    this.clicker.stop();
    if (this.metronome) {
      take.tempoMap = [{ time: 0, bpm: this.metronome.bpm }];
      take.timeSignature = [this.metronome.beats, 4];
    }
    const camera = await stopCameraRecording();
    const micAudio = await this.stopMic();
    if (take.tracks.every((t) => t.notes.length === 0)) return null;
    if (micAudio) {
      const key = `${take.id}.${micAudio.blob.type.includes('ogg') ? 'ogg' : 'webm'}`;
      await saveMedia(micAudio.blob, key);
      take.media.push({
        kind: 'audio',
        storageKey: key,
        offset: Math.round((micAudio.startedAt - this.recordStart) * 1000) / 1000,
      });
    }
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

// Las ediciones de una toma guardada (manos, dedos, notas) se guardan solas.
setTakeEditedListener((take) => {
  if (useLive.getState().takes.some((t) => t.id === take.id)) void saveTake(take);
});
