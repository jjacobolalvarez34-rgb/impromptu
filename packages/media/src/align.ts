import type { NoteEvent } from '@impromptu/core';

/**
 * Sincronía automática entre un audio y el MIDI de la misma pieza (ROADMAP fase 3):
 * se comparan los ataques del audio (subidas de energía) con los inicios de las notas
 * y se busca el desfase que mejor los hace coincidir (correlación cruzada).
 */

/** Resolución del análisis: un valor cada 10 ms. */
export const HOP = 0.01;

/**
 * Curva de ataques del audio: cuánto sube la energía (en escala logarítmica) de una
 * ventana de 10 ms a la siguiente. Solo cuentan las subidas.
 */
export function audioOnsets(samples: Float32Array, sampleRate: number, hop = HOP): Float32Array {
  const step = Math.max(1, Math.round(sampleRate * hop));
  const frames = Math.floor(samples.length / step);
  const energy = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    let sum = 0;
    const start = f * step;
    for (let i = start; i < start + step; i++) {
      const s = samples[i]!;
      sum += s * s;
    }
    energy[f] = Math.log10(1e-9 + sum / step);
  }
  const onsets = new Float32Array(frames);
  for (let f = 1; f < frames; f++) onsets[f] = Math.max(0, energy[f]! - energy[f - 1]!);
  return normalize(onsets);
}

/** Curva de ataques del MIDI: un impulso por nota (pesado por su fuerza), suavizado. */
export function midiOnsets(notes: readonly NoteEvent[], frames: number, hop = HOP): Float32Array {
  const raw = new Float32Array(frames);
  for (const n of notes) {
    const f = Math.round(n.start / hop);
    if (f >= 0 && f < frames) raw[f]! += 0.3 + 0.7 * (n.velocity / 127);
  }
  return normalize(smooth(raw, 2));
}

export interface Alignment {
  /** Segundos que hay que correr el audio respecto al MIDI (MediaRef.offset). */
  offset: number;
  /** Qué tan claro es el resultado: pico de correlación frente al promedio (≥ 3 suele ser bueno). */
  confidence: number;
}

/**
 * Busca el desfase entre ±maxLag segundos. Un offset positivo significa que el audio
 * empieza después que el MIDI: el segundo 0 del audio suena en el segundo `offset` de la toma.
 */
export function align(audio: Float32Array, midi: Float32Array, maxLag = 10, hop = HOP): Alignment {
  const maxShift = Math.round(maxLag / hop);
  const scores = new Float32Array(maxShift * 2 + 1);
  for (let k = -maxShift; k <= maxShift; k++) {
    // audio[i] se compara con midi[i + k]
    let sum = 0;
    const from = Math.max(0, -k);
    const to = Math.min(audio.length, midi.length - k);
    for (let i = from; i < to; i++) sum += audio[i]! * midi[i + k]!;
    scores[k + maxShift] = sum;
  }
  let best = 0;
  let mean = 0;
  for (let i = 0; i < scores.length; i++) {
    mean += scores[i]!;
    if (scores[i]! > scores[best]!) best = i;
  }
  mean /= scores.length;
  const peak = scores[best]!;
  return {
    offset: Math.round((maxShift - best) * hop * 1000) / 1000,
    confidence: mean > 0 ? peak / mean : peak > 0 ? Infinity : 0,
  };
}

/** Atajo: alinea un audio (mono) con las notas de una toma. */
export function alignAudioToNotes(
  samples: Float32Array,
  sampleRate: number,
  notes: readonly NoteEvent[],
  maxLag = 10,
): Alignment {
  const a = audioOnsets(samples, sampleRate);
  const lastNote = notes.reduce((m, n) => Math.max(m, n.start), 0);
  const frames = Math.max(a.length, Math.ceil(lastNote / HOP) + 1);
  return align(a, midiOnsets(notes, frames), maxLag);
}

/** Mezcla a mono los canales de un audio decodificado. */
export function toMono(channels: readonly Float32Array[]): Float32Array {
  const first = channels[0];
  if (!first) return new Float32Array(0);
  if (channels.length === 1) return first;
  const out = new Float32Array(first.length);
  for (const ch of channels)
    for (let i = 0; i < out.length; i++) out[i]! += ch[i]! / channels.length;
  return out;
}

/** Picos de la forma de onda para dibujarla: `columns` valores entre 0 y 1. */
export function waveformPeaks(samples: Float32Array, columns: number): Float32Array {
  const peaks = new Float32Array(Math.max(1, columns));
  const per = samples.length / peaks.length;
  for (let c = 0; c < peaks.length; c++) {
    let max = 0;
    const end = Math.min(samples.length, Math.floor((c + 1) * per));
    for (let i = Math.floor(c * per); i < end; i++) max = Math.max(max, Math.abs(samples[i]!));
    peaks[c] = max;
  }
  return normalize(peaks);
}

function smooth(x: Float32Array, radius: number): Float32Array {
  const out = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) {
    let sum = 0;
    let w = 0;
    for (let j = -radius; j <= radius; j++) {
      const v = x[i + j];
      if (v === undefined) continue;
      const k = radius + 1 - Math.abs(j);
      sum += v * k;
      w += k;
    }
    out[i] = sum / w;
  }
  return out;
}

function normalize(x: Float32Array): Float32Array {
  let max = 0;
  for (const v of x) max = Math.max(max, v);
  if (max > 0) for (let i = 0; i < x.length; i++) x[i]! /= max;
  return x;
}
