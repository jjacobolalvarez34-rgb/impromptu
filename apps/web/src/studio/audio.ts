import { LivePlayer, Piano, takeVoices } from '@impromptu/audio';
import type { LiveVoiceHandle, Voice } from '@impromptu/audio';
import type { Take } from '@impromptu/core';
import { create } from 'zustand';
import { transport } from './store';

/** Cuánto por delante se programa el audio y cada cuánto se revisa (s / ms). */
const HORIZON = 0.3;
const TICK_MS = 40;

export type AudioStatus = 'idle' | 'loading' | 'ready' | 'error';

interface AudioState {
  status: AudioStatus;
  /** 0–1 mientras se descargan las muestras. */
  progress: number;
  /** "Sonido de la app": se apaga si el teclado ya suena por sus parlantes (BUGS B-009). */
  enabled: boolean;
  setEnabled: (on: boolean) => void;
}

export const useAudio = create<AudioState>((set) => ({
  status: 'idle',
  progress: 0,
  enabled: true,
  setEnabled: (enabled) => {
    set({ enabled });
    if (!enabled) engine.live?.reset();
    engine.reschedule();
  },
}));

/**
 * Programa las notas de la toma en el piano siguiendo el transporte. El reloj del
 * transporte pasa a ser el del AudioContext para que imagen y sonido no se separen.
 */
class AudioEngine {
  private context: AudioContext | null = null;
  private piano: Piano | null = null;
  private voices: Voice[] = [];
  private cursor = 0;
  private timer = 0;
  private latency = 0;
  private livePlayer: LivePlayer<LiveVoiceHandle> | null = null;

  /** Piano para tocar en vivo; null si aún no carga o si el sonido de la app está apagado. */
  get live(): LivePlayer<LiveVoiceHandle> | null {
    return useAudio.getState().enabled ? this.livePlayer : null;
  }

  constructor() {
    transport.subscribe(() => this.reschedule());
  }

  /** Crea el audio en el primer gesto del usuario (BUGS B-008) y descarga el piano. */
  async start(): Promise<void> {
    if (this.context) {
      if (this.context.state === 'suspended') await this.context.resume();
      return;
    }
    const context = new AudioContext({ latencyHint: 'interactive' });
    this.context = context;
    this.latency = context.outputLatency || context.baseLatency || 0;
    transport.setClock(() => context.currentTime - this.latency);
    const piano = new Piano(context);
    useAudio.setState({ status: 'loading', progress: 0 });
    try {
      await piano.load(({ loaded, total }) => useAudio.setState({ progress: loaded / total }));
      this.piano = piano;
      this.livePlayer = new LivePlayer(piano);
      useAudio.setState({ status: 'ready', progress: 1 });
      this.reschedule();
    } catch {
      useAudio.setState({ status: 'error' });
    }
  }

  /** Apaga el audio por completo (al recargar este módulo en desarrollo). */
  dispose(): void {
    window.clearInterval(this.timer);
    this.piano?.stopAll();
    void this.context?.close();
  }

  setTake(take: Take | null): void {
    this.voices = take ? takeVoices(take) : [];
    this.reschedule();
  }

  /** Corta lo programado y vuelve a programar desde el instante actual. */
  reschedule(): void {
    this.piano?.stopAll();
    window.clearInterval(this.timer);
    const t = transport.now();
    this.cursor = lowerBound(this.voices, t);
    if (!transport.playing || !this.piano || !useAudio.getState().enabled) return;
    this.chase(t);
    this.tick();
    this.timer = window.setInterval(() => this.tick(), TICK_MS);
  }

  /**
   * Notas que ya sonaban en t (empezaron antes y su apagador aún no cae): se tocan desde
   * su punto medio para que al buscar o repetir una sección se oiga lo que se ve.
   */
  private chase(t: number): void {
    const piano = this.piano;
    if (!piano) return;
    const loopEnd = transport.loop?.end ?? Infinity;
    for (let i = lowerBound(this.voices, t - CHASE_WINDOW); i < this.cursor; i++) {
      const v = this.voices[i]!;
      if (v.start >= t || v.release <= t + 0.02) continue;
      const release = Math.min(v.release, loopEnd);
      const elapsed = (t - v.start) / transport.speed;
      piano.play(
        v,
        transport.toClock(t) + this.latency,
        transport.toClock(release) + this.latency,
        elapsed,
      );
    }
  }

  private tick(): void {
    const piano = this.piano;
    if (!piano || !transport.playing) return;
    const t = transport.now();
    if (transport.wrapped(t)) {
      piano.stopAll();
      this.cursor = lowerBound(this.voices, t);
      this.chase(t);
    }
    const horizon = t + HORIZON * transport.speed;
    const loopEnd = transport.loop?.end ?? Infinity;
    while (this.cursor < this.voices.length) {
      const v = this.voices[this.cursor]!;
      if (v.start > horizon || v.start >= loopEnd) break;
      this.cursor++;
      if (v.start < t - 0.02) continue; // ya pasó (después de buscar)
      const release = Math.min(v.release, loopEnd);
      piano.play(
        v,
        transport.toClock(v.start) + this.latency,
        transport.toClock(release) + this.latency,
      );
    }
  }
}

/** Duración máxima que se considera al buscar notas que ya sonaban (s). */
const CHASE_WINDOW = 30;

function lowerBound(voices: readonly Voice[], t: number): number {
  let lo = 0;
  let hi = voices.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (voices[mid]!.start < t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export const engine = new AudioEngine();

import.meta.hot?.dispose(() => engine.dispose());
