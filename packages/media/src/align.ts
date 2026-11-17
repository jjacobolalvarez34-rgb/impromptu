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
  const rise = new Float32Array(frames);
  for (let f = 1; f < frames; f++) rise[f] = Math.max(0, energy[f]! - energy[f - 1]!);
  // Solo cuentan las subidas que destacan sobre su entorno (umbral adaptable): así el
  // pedal y la reverberación no tapan los ataques.
  const local = smooth(rise, 15);
  const onsets = new Float32Array(frames);
  for (let f = 0; f < frames; f++) onsets[f] = Math.max(0, rise[f]! - 1.5 * local[f]!);
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
  /** Qué tan claro es el resultado: parecido en el mejor desfase frente a la mediana (1 = nada). */
  confidence: number;
  /**
   * Si dos métodos independientes (notas que suenan y ataques) dan el mismo desfase.
   * Con las grabaciones de Jacobo coinciden cuando MIDI y audio son la misma versión.
   */
  agree: boolean;
}

/**
 * Busca el desfase entre ±maxLag segundos, con la convención de MediaRef.offset: el segundo 0
 * del audio suena en el segundo `offset` de la toma (segundo de la toma = segundo del archivo
 * + offset). Si el archivo trae silencio o algo antes de la pieza, el offset es negativo.
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
    // audio[i] ↔ midi[i + k]: el segundo i del archivo es el i + k de la toma.
    offset: Math.round((best - maxShift) * hop * 1000) / 1000,
    confidence: mean > 0 ? peak / mean : peak > 0 ? Infinity : 0,
    agree: true,
  };
}

// ── Cromagrama: qué notas (de las 12) suenan en cada instante ─────────────────────────

/** Resolución del cromagrama (más gruesa que los ataques: es para ubicar, no para afinar). */
export const CHROMA_HOP = 0.05;
const FFT_SIZE = 4096;

/** FFT radix-2 en el lugar (re e im del mismo largo, potencia de 2). */
export function fft(re: Float32Array, im: Float32Array): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j]!, re[i]!];
      [im[i], im[j]] = [im[j]!, im[i]!];
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wr = Math.cos(ang);
    const wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1;
      let ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const a = i + k;
        const b = a + len / 2;
        const tr = re[b]! * cr - im[b]! * ci;
        const ti = re[b]! * ci + im[b]! * cr;
        re[b] = re[a]! - tr;
        im[b] = im[a]! - ti;
        re[a]! += tr;
        im[a]! += ti;
        const ncr = cr * wr - ci * wi;
        ci = cr * wi + ci * wr;
        cr = ncr;
      }
    }
  }
}

/** Cromagrama del audio: 12 valores por cuadro (C, C#, …, B), normalizados. */
export function audioChroma(
  samples: Float32Array,
  sampleRate: number,
  hop = CHROMA_HOP,
): Float32Array[] {
  const step = Math.max(1, Math.round(sampleRate * hop));
  const frames = Math.floor(samples.length / step);
  const window = new Float32Array(FFT_SIZE);
  for (let i = 0; i < FFT_SIZE; i++) window[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / FFT_SIZE);
  // Qué clase de nota corresponde a cada bin (de 55 Hz a 2 kHz; el resto no aporta).
  const binClass = new Int8Array(FFT_SIZE / 2).fill(-1);
  for (let k = 1; k < FFT_SIZE / 2; k++) {
    const f = (k * sampleRate) / FFT_SIZE;
    if (f < 55 || f > 2000) continue;
    const midi = 69 + 12 * Math.log2(f / 440);
    binClass[k] = ((Math.round(midi) % 12) + 12) % 12;
  }
  const re = new Float32Array(FFT_SIZE);
  const im = new Float32Array(FFT_SIZE);
  const out: Float32Array[] = [];
  // Energía de cada cuadro: el silencio no debe "parecerse" a nada.
  const energy = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    let e = 0;
    for (let i = f * step; i < (f + 1) * step && i < samples.length; i++)
      e += samples[i]! * samples[i]!;
    energy[f] = e / step;
  }
  const loud = Math.max(...energy);
  for (let f = 0; f < frames; f++) {
    if (energy[f]! < loud * 1e-3) {
      out.push(new Float32Array(12));
      continue;
    }
    const center = f * step;
    for (let i = 0; i < FFT_SIZE; i++) {
      re[i] = (samples[center - FFT_SIZE / 2 + i] ?? 0) * window[i]!;
      im[i] = 0;
    }
    fft(re, im);
    const chroma = new Float32Array(12);
    for (let k = 1; k < FFT_SIZE / 2; k++) {
      const c = binClass[k]!;
      if (c >= 0) chroma[c]! += Math.log1p(100 * Math.hypot(re[k]!, im[k]!));
    }
    out.push(unit(chroma));
  }
  return out;
}

/** Cromagrama del MIDI: las notas que suenan en cada cuadro, pesadas por su fuerza. */
export function midiChroma(
  notes: readonly NoteEvent[],
  frames: number,
  hop = CHROMA_HOP,
): Float32Array[] {
  const out = Array.from({ length: frames }, () => new Float32Array(12));
  for (const n of notes) {
    const from = Math.max(0, Math.floor(n.start / hop));
    // Las notas siguen sonando un poco después de soltarlas (cola del piano).
    const to = Math.min(frames - 1, Math.ceil((n.end + 0.15) / hop));
    const w = 0.3 + 0.7 * (n.velocity / 127);
    for (let f = from; f <= to; f++) out[f]![n.pitch % 12]! += w;
  }
  return out.map(unit);
}

/** Desfase aproximado por cromagrama: lag (en cuadros) con mayor parecido y su confianza. */
function chromaLag(audio: Float32Array[], midi: Float32Array[], maxShift: number) {
  const scores = new Float32Array(maxShift * 2 + 1);
  for (let k = -maxShift; k <= maxShift; k++) {
    let sum = 0;
    const from = Math.max(0, -k);
    const to = Math.min(audio.length, midi.length - k);
    for (let i = from; i < to; i++) {
      const a = audio[i]!;
      const m = midi[i + k]!;
      for (let c = 0; c < 12; c++) sum += a[c]! * m[c]!;
    }
    scores[k + maxShift] = sum;
  }
  let best = 0;
  for (let i = 1; i < scores.length; i++) if (scores[i]! > scores[best]!) best = i;
  const sorted = Array.from(scores).sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)]!;
  return { lag: best - maxShift, peak: scores[best]!, median };
}

/**
 * Sincroniza un audio (mono) con las notas de una toma en dos pasos:
 * 1. Cromagrama (qué notas suenan): ubica el desfase sin confundirse por un pulso, porque
 *    distingue un acorde de otro aunque caigan en tiempos parecidos.
 * 2. Ataques: afina ese desfase al centésimo de segundo, buscando solo cerca (±150 ms).
 */
export function alignAudioToNotes(
  samples: Float32Array,
  sampleRate: number,
  notes: readonly NoteEvent[],
  maxLag = 10,
): Alignment {
  const lastNote = notes.reduce((m, n) => Math.max(m, n.end), 0);

  const ac = audioChroma(samples, sampleRate);
  const mc = midiChroma(notes, Math.max(ac.length, Math.ceil(lastNote / CHROMA_HOP) + 1));
  const coarse = chromaLag(ac, mc, Math.round(maxLag / CHROMA_HOP));
  const coarseOffset = coarse.lag * CHROMA_HOP;

  const a = audioOnsets(samples, sampleRate);
  const frames = Math.max(a.length, Math.ceil(lastNote / HOP) + 1);
  const m = midiOnsets(notes, frames);
  const fine = alignNear(a, m, coarseOffset, 0.15);
  // Segunda opinión: solo con ataques, en todo el rango. Si no coincide, hay que revisar de oído.
  const byOnsets = align(a, m, maxLag);

  return {
    offset: fine,
    // Pico del parecido de notas frente a la mediana de todos los desfases probados.
    confidence: coarse.median > 0 ? coarse.peak / coarse.median : 0,
    agree: Math.abs(byOnsets.offset - fine) <= 0.1,
  };
}

/** Busca el mejor desfase de ataques solo en ±radius alrededor de `center` (s). */
function alignNear(
  audio: Float32Array,
  midi: Float32Array,
  center: number,
  radius: number,
): number {
  const c = Math.round(center / HOP);
  const r = Math.round(radius / HOP);
  let bestK = c;
  let bestScore = -Infinity;
  for (let k = c - r; k <= c + r; k++) {
    let sum = 0;
    const from = Math.max(0, -k);
    const to = Math.min(audio.length, midi.length - k);
    for (let i = from; i < to; i++) sum += audio[i]! * midi[i + k]!;
    if (sum > bestScore) {
      bestScore = sum;
      bestK = k;
    }
  }
  return Math.round(bestK * HOP * 1000) / 1000;
}

function unit(v: Float32Array): Float32Array {
  let norm = 0;
  for (const x of v) norm += x * x;
  norm = Math.sqrt(norm);
  if (norm > 0) for (let i = 0; i < v.length; i++) v[i]! /= norm;
  return v;
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
