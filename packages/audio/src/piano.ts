import type { Take } from '@impromptu/core';
import {
  DEFAULT_LAYERS,
  DEFAULT_SAMPLE_BASE,
  SAMPLED_PITCHES,
  layerFor,
  layerGain,
  nearestSample,
  sampleName,
} from './salamander';
import { resolveVoices } from './sustain';
import type { Voice } from './sustain';

/** Caché del navegador donde quedan las muestras: después de la primera vez, sin internet. */
const CACHE_NAME = 'impromptu-salamander-v1';
const PARALLEL_DOWNLOADS = 6;
/** Tiempo de caída del apagador (s): corto como en un piano real, sin clic. */
const DAMPER = 0.12;
const MASTER_GAIN = 0.55;
/**
 * Polifonía máxima, como un piano digital: si se pasa, la voz más vieja se apaga rápido.
 * Sin límite, una ráfaga muy densa (la prueba de 2.000 notas) satura el audio y se corta.
 */
export const MAX_VOICES = 64;
const STEAL_FADE = 0.008;
/** Entrada de una nota que se retoma por la mitad. */
const CHASE_FADE = 0.012;

interface ActiveVoice {
  source: AudioBufferSourceNode;
  gain: GainNode;
  /** Instante (reloj del contexto) en que deja de sonar; Infinity si es en vivo y sigue abajo. */
  end: number;
}

export interface LoadProgress {
  loaded: number;
  total: number;
}

export interface PianoOptions {
  baseUrl?: string;
  layers?: readonly number[];
}

/**
 * Piano de cola (Salamander) con Web Audio. Descarga las muestras una vez y las guarda
 * en la caché del navegador. Sirve igual con un OfflineAudioContext para exportar (fase 3).
 */
export class Piano {
  private readonly buffers = new Map<string, AudioBuffer>();
  readonly output: GainNode;
  private readonly baseUrl: string;
  private readonly layers: readonly number[];
  private active: ActiveVoice[] = [];

  constructor(
    readonly context: BaseAudioContext,
    options: PianoOptions = {},
  ) {
    this.baseUrl = options.baseUrl ?? DEFAULT_SAMPLE_BASE;
    this.layers = options.layers ?? DEFAULT_LAYERS;
    this.output = context.createGain();
    this.output.gain.value = MASTER_GAIN;
    this.output.connect(context.destination);
  }

  get loaded(): boolean {
    return this.buffers.size === SAMPLED_PITCHES.length * this.layers.length;
  }

  /** Usa las muestras ya decodificadas de otro piano (por ejemplo, para exportar sin volver a descargar). */
  shareSamplesFrom(other: Piano): void {
    for (const [name, buffer] of other.buffers) this.buffers.set(name, buffer);
  }

  /** Descarga (o lee de la caché) y decodifica todas las muestras. */
  async load(onProgress?: (p: LoadProgress) => void): Promise<void> {
    const names = SAMPLED_PITCHES.flatMap((p) => this.layers.map((l) => sampleName(p, l)));
    const total = names.length;
    let loaded = 0;
    const cache = 'caches' in globalThis ? await caches.open(CACHE_NAME) : null;
    const queue = names.filter((n) => !this.buffers.has(n));
    loaded = total - queue.length;
    onProgress?.({ loaded, total });

    const worker = async () => {
      for (let name = queue.shift(); name; name = queue.shift()) {
        const url = `${this.baseUrl}${name}.mp3`;
        let response = await cache?.match(url);
        if (!response) {
          response = await fetch(url);
          if (!response.ok) throw new Error(`No se pudo descargar ${name}`);
          await cache?.put(url, response.clone());
        }
        const buffer = await this.context.decodeAudioData(await response.arrayBuffer());
        this.buffers.set(name, buffer);
        loaded++;
        onProgress?.({ loaded, total });
      }
    };
    await Promise.all(Array.from({ length: PARALLEL_DOWNLOADS }, worker));
  }

  /**
   * Programa una voz. `at` y `releaseAt` están en el reloj del contexto. `offset` (s) hace
   * sonar una nota que ya había empezado desde su punto medio, con una entrada corta para
   * que no suene un clic (al buscar o al repetir una sección).
   */
  play(voice: Voice, at: number, releaseAt: number, offset = 0): void {
    if (!Number.isFinite(at)) return;
    if (!Number.isFinite(releaseAt)) releaseAt = at + 30; // protección: nunca un final infinito
    const { note } = voice;
    const sample = nearestSample(note.pitch);
    const layer = layerFor(note.velocity, this.layers);
    const buffer = this.buffers.get(sampleName(sample, layer));
    if (!buffer) return;

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    const rate = Math.pow(2, (note.pitch - sample) / 12);
    source.playbackRate.value = rate;
    const gain = this.context.createGain();
    const level = layerGain(note.velocity, layer) * voice.gain;
    if (offset > 0) {
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(level, at + CHASE_FADE);
    } else {
      gain.gain.setValueAtTime(level, at);
    }
    gain.gain.setValueAtTime(level, releaseAt);
    gain.gain.setTargetAtTime(0, releaseAt, DAMPER / 3);
    this.admit(at);
    source.connect(gain).connect(this.output);
    const sampleOffset = offset * rate;
    if (sampleOffset >= buffer.duration) return;
    source.start(at, sampleOffset);
    source.stop(releaseAt + DAMPER * 4);
    this.track({ source, gain, end: releaseAt + DAMPER * 4 });
  }

  /** En vivo: hace sonar una tecla ya, sin saber cuándo se soltará. Devuelve null si no hay muestras. */
  strike(pitch: number, velocity: number, gainScale = 1): LiveVoiceHandle | null {
    const sample = nearestSample(pitch);
    const layer = layerFor(velocity, this.layers);
    const buffer = this.buffers.get(sampleName(sample, layer));
    if (!buffer) return null;
    const at = this.context.currentTime;
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = Math.pow(2, (pitch - sample) / 12);
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(layerGain(velocity, layer) * gainScale, at);
    this.admit(at);
    source.connect(gain).connect(this.output);
    source.start(at);
    this.track({ source, gain, end: Infinity });
    return { source, gain };
  }

  /** En vivo: cae el apagador sobre una voz de `strike`. */
  damp(voice: LiveVoiceHandle): void {
    const at = this.context.currentTime;
    voice.gain.gain.cancelScheduledValues(at);
    voice.gain.gain.setValueAtTime(voice.gain.gain.value, at);
    voice.gain.gain.setTargetAtTime(0, at, DAMPER / 3);
    try {
      voice.source.stop(at + DAMPER * 4);
    } catch {
      // Ya estaba detenida.
    }
    const entry = this.active.find((v) => v.source === voice.source);
    if (entry) entry.end = at + DAMPER * 4;
  }

  /** Corta todo lo que está sonando o programado (pausar, buscar, cambiar de pieza). */
  stopAll(): void {
    const now = this.context.currentTime;
    for (const { source } of this.active) {
      try {
        source.stop(now + 0.02);
      } catch {
        // Ya estaba detenida.
      }
    }
    this.active = [];
  }

  /** Antes de una voz nueva en `at`: olvida las que ya terminaron y roba la más vieja si hace falta. */
  private admit(at: number): void {
    this.active = this.active.filter((v) => v.end > at);
    while (this.active.length >= MAX_VOICES) {
      const oldest = this.active.shift()!;
      oldest.gain.gain.cancelScheduledValues(at);
      oldest.gain.gain.setTargetAtTime(0, at, STEAL_FADE);
      try {
        oldest.source.stop(at + STEAL_FADE * 6);
      } catch {
        // Ya estaba detenida.
      }
    }
  }

  private track(voice: ActiveVoice): void {
    this.active.push(voice);
    voice.source.onended = () => {
      const i = this.active.indexOf(voice);
      if (i >= 0) this.active.splice(i, 1);
    };
  }
}

/** Voces de una toma, ordenadas, listas para el programador. */
export function takeVoices(take: Take): Voice[] {
  return take.tracks
    .filter((t) => t.instrument === 'piano')
    .flatMap((t) => resolveVoices(t.notes, t.pedals, take.duration))
    .sort((a, b) => a.start - b.start);
}

export interface LiveVoiceHandle {
  source: AudioBufferSourceNode;
  gain: GainNode;
}
