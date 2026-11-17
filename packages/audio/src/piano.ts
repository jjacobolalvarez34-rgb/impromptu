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
  private readonly sounding = new Set<AudioBufferSourceNode>();

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
   * Programa una voz. `at` y `releaseAt` están en el reloj del contexto; `rate` es la
   * velocidad de reproducción de la toma (las notas se acortan, el tono no cambia).
   */
  play(voice: Voice, at: number, releaseAt: number): void {
    const { note } = voice;
    const sample = nearestSample(note.pitch);
    const layer = layerFor(note.velocity, this.layers);
    const buffer = this.buffers.get(sampleName(sample, layer));
    if (!buffer) return;

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = Math.pow(2, (note.pitch - sample) / 12);
    const gain = this.context.createGain();
    const level = layerGain(note.velocity, layer) * voice.gain;
    gain.gain.setValueAtTime(level, at);
    gain.gain.setValueAtTime(level, releaseAt);
    gain.gain.setTargetAtTime(0, releaseAt, DAMPER / 3);
    source.connect(gain).connect(this.output);
    source.start(at);
    source.stop(releaseAt + DAMPER * 4);
    this.sounding.add(source);
    source.onended = () => this.sounding.delete(source);
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
    source.connect(gain).connect(this.output);
    source.start(at);
    this.sounding.add(source);
    source.onended = () => this.sounding.delete(source);
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
  }

  /** Corta todo lo que está sonando o programado (pausar, buscar, cambiar de pieza). */
  stopAll(): void {
    const now = this.context.currentTime;
    for (const source of this.sounding) {
      try {
        source.stop(now + 0.02);
      } catch {
        // Ya estaba detenida.
      }
    }
    this.sounding.clear();
  }
}

/** Voces de una toma, ordenadas, listas para el programador. */
export function takeVoices(take: Take): Voice[] {
  return take.tracks
    .filter((t) => t.instrument === 'piano')
    .flatMap((t) => resolveVoices(t.notes, t.pedals))
    .sort((a, b) => a.start - b.start);
}

export interface LiveVoiceHandle {
  source: AudioBufferSourceNode;
  gain: GainNode;
}
