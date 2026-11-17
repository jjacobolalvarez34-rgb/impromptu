import { beatGrid } from '@impromptu/core';
import type { NoteEvent, Take } from '@impromptu/core';

/** Pulsos de una toma: el tiempo (s) de cada negra, y el tempo medio. */
export interface Beats {
  times: number[];
  bpm: number;
  /** De dónde salieron: del archivo MIDI o estimados de los ataques. */
  source: 'tempo-map' | 'estimated' | 'manual';
}

const HOP = 0.01; // 10 ms
const MIN_BPM = 40;
const MAX_BPM = 220;
/** Preferencia de tempo (Ellis 2007): centrada en 120 BPM, ancho de 1 octava. */
const PRIOR_BPM = 110;
const PRIOR_WIDTH = 1;
/** Rigidez del tempo en el seguimiento de pulsos: 30 sigue algo del rubato sin deformar los compases (medido con Consuelo y Nostalgia). */
const TIGHTNESS = 30;

/** Envolvente de ataques: un impulso por nota (pesado por la fuerza), suavizado. */
export function onsetEnvelope(notes: readonly NoteEvent[], duration: number): Float32Array {
  const n = Math.max(1, Math.ceil(duration / HOP) + 1);
  const env = new Float32Array(n);
  for (const note of notes) {
    const i = Math.round(note.start / HOP);
    if (i >= 0 && i < n) env[i] = env[i]! + 0.3 + note.velocity / 127;
  }
  // Suavizado gaussiano corto (±30 ms) para tolerar notas de un acorde que no caen juntas.
  const out = new Float32Array(n);
  const kernel = [0.05, 0.25, 0.4, 0.25, 0.05].map((w) => w * 1);
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let k = -2; k <= 2; k++) s += (env[i + k] ?? 0) * kernel[k + 2]!;
    out[i] = s;
  }
  return out;
}

/** Tempo más probable (BPM) por autocorrelación de la envolvente con preferencia por ~110 BPM. */
export function estimateTempo(env: Float32Array): number {
  const minLag = Math.round(60 / MAX_BPM / HOP);
  const maxLag = Math.round(60 / MIN_BPM / HOP);
  let best = 120;
  let bestScore = -Infinity;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let s = 0;
    for (let i = lag; i < env.length; i++) s += env[i]! * env[i - lag]!;
    s /= env.length - lag;
    const bpm = 60 / (lag * HOP);
    const prior = Math.exp(-0.5 * (Math.log2(bpm / PRIOR_BPM) / PRIOR_WIDTH) ** 2);
    // Se suma la autocorrelación del doble del período: las piezas marcan también la blanca.
    let s2 = 0;
    const lag2 = lag * 2;
    if (lag2 < env.length) {
      for (let i = lag2; i < env.length; i++) s2 += env[i]! * env[i - lag2]!;
      s2 /= env.length - lag2;
    }
    const score = (s + 0.5 * s2) * prior;
    if (score > bestScore) {
      bestScore = score;
      best = bpm;
    }
  }
  return best;
}

/**
 * Seguimiento de pulsos por programación dinámica (Ellis 2007): cada pulso cae en un ataque
 * fuerte y a un período del anterior. Devuelve los tiempos de los pulsos (s).
 */
export function trackBeats(env: Float32Array, bpm: number, tightness = TIGHTNESS): number[] {
  const period = 60 / bpm / HOP;
  const n = env.length;
  const score = new Float64Array(n);
  const back = new Int32Array(n).fill(-1);
  const lo = Math.round(period / 2);
  const hi = Math.round(period * 2);
  for (let i = 0; i < n; i++) {
    let bestPrev = -1;
    let bestVal = 0;
    for (let d = lo; d <= hi && i - d >= 0; d++) {
      const penalty = -tightness * Math.log(d / period) ** 2;
      const v = score[i - d]! + penalty;
      if (bestPrev < 0 || v > bestVal) {
        bestVal = v;
        bestPrev = i - d;
      }
    }
    score[i] = env[i]! + (bestPrev >= 0 ? Math.max(0, bestVal) : 0);
    back[i] = bestVal > 0 ? bestPrev : -1;
  }
  // El último pulso: el de mayor puntaje en el último período.
  let end = n - 1;
  for (let i = Math.max(0, n - Math.round(period)); i < n; i++)
    if (score[i]! > score[end]!) end = i;
  const beats: number[] = [];
  for (let i = end; i >= 0; i = back[i]!) {
    beats.push(i * HOP);
    if (back[i]! < 0) break;
  }
  beats.reverse();
  // Se extiende hacia atrás y adelante con el mismo período (silencios al comienzo o al final).
  const step = period * HOP;
  while (beats[0]! - step > -step / 2) beats.unshift(beats[0]! - step);
  const last = (n - 1) * HOP;
  while (beats[beats.length - 1]! + step <= last + step)
    beats.push(beats[beats.length - 1]! + step);
  return beats.map((t) => Math.max(0, t));
}

/** Pulsos a tempo fijo desde `first` (s): para el tempo puesto a mano. */
export function steadyBeats(bpm: number, first: number, duration: number): number[] {
  const step = 60 / bpm;
  const out: number[] = [];
  for (let t = first; t <= duration + step; t += step) out.push(t);
  return out;
}

/**
 * Pulsos de una toma: del mapa de tempo si lo trae (MIDI de un DAW); si no, estimados de los
 * ataques (tomas grabadas o transcritas). Siempre en negras.
 */
/**
 * Qué tan bien caen los ataques en una cuadrícula de semicorcheas (y tresillos) sobre estos
 * pulsos: fracción de notas a menos de 35 ms de algún punto de la cuadrícula.
 */
export function gridFit(notes: readonly NoteEvent[], times: readonly number[]): number {
  if (notes.length === 0 || times.length < 2) return 0;
  let hits = 0;
  let j = 0;
  for (const n of [...notes].sort((a, b) => a.start - b.start)) {
    while (j + 2 < times.length && times[j + 1]! <= n.start) j++;
    const a = times[j]!;
    const len = times[j + 1]! - a;
    const x = (n.start - a) / len;
    const near = Math.min(
      ...[4, 3].map((sub) => Math.abs(x * sub - Math.round(x * sub)) * (len / sub)),
    );
    if (near <= 0.035) hits++;
  }
  return hits / notes.length;
}

/**
 * Pulsos de una toma: del mapa de tempo si lo trae (MIDI de un DAW) y si las notas de verdad
 * caen en su cuadrícula; si no (tomas grabadas, transcritas, o un MIDI tocado sin metrónomo que
 * quedó con el tempo por defecto del DAW), estimados de los ataques. Siempre en negras.
 */
export function beatsOf(take: Take, manual?: { bpm: number; first: number }): Beats {
  const notes = take.tracks.flatMap((t) => t.notes);
  const duration = Math.max(take.duration, ...notes.map((n) => n.end), 1);
  if (manual)
    return {
      times: steadyBeats(manual.bpm, manual.first, duration),
      bpm: manual.bpm,
      source: 'manual',
    };
  const env = onsetEnvelope(notes, duration + 1);
  const bpm = estimateTempo(env);
  const estimated: Beats = {
    times: trackBeats(env, bpm),
    bpm: Math.round(bpm),
    source: 'estimated',
  };
  if (take.tempoMap.length > 0) {
    const grid = beatGrid(take.tempoMap, [4, 4], duration + 2);
    const fromFile: Beats = {
      times: grid.map((b) => b.time),
      bpm: take.tempoMap[0]!.bpm,
      source: 'tempo-map',
    };
    // Si las notas caen en la cuadrícula del archivo (tocado con metrónomo), manda el archivo.
    const fileFit = gridFit(notes, fromFile.times);
    if (fileFit >= 0.8 || fileFit >= gridFit(notes, estimated.times)) return fromFile;
  }
  return estimated;
}
