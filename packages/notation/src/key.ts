import type { NoteEvent } from '@impromptu/core';

/**
 * Armadura por correlación con los perfiles de tonalidad de Krumhansl y Kessler (1982): se
 * comparan las clases de altura pesadas por duración con los 24 tonos mayores y menores.
 */
const MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

/** Quintas de la armadura de cada tónica mayor (do = 0, re♭ = -5, …). */
const MAJOR_FIFTHS = [0, -5, 2, -3, 4, -1, 6, 1, -4, 3, -2, 5];

function correlation(a: readonly number[], b: readonly number[]): number {
  const ma = a.reduce((s, x) => s + x, 0) / a.length;
  const mb = b.reduce((s, x) => s + x, 0) / b.length;
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < a.length; i++) {
    num += (a[i]! - ma) * (b[i]! - mb);
    da += (a[i]! - ma) ** 2;
    db += (b[i]! - mb) ** 2;
  }
  return da > 0 && db > 0 ? num / Math.sqrt(da * db) : 0;
}

export interface Key {
  /** Tónica (clase de altura, do = 0). */
  tonic: number;
  mode: 'major' | 'minor';
  /** Quintas de la armadura (-7 a 7). */
  fifths: number;
}

export function estimateKey(notes: readonly NoteEvent[]): Key {
  const hist = new Array<number>(12).fill(0);
  for (const n of notes) hist[n.pitch % 12]! += Math.max(0.05, n.end - n.start);
  if (hist.every((x) => x === 0)) return { tonic: 0, mode: 'major', fifths: 0 };
  let best: Key = { tonic: 0, mode: 'major', fifths: 0 };
  let bestR = -Infinity;
  for (let tonic = 0; tonic < 12; tonic++) {
    const rotated = hist.map((_, i) => hist[(i + tonic) % 12]!);
    const rMaj = correlation(rotated, MAJOR);
    const rMin = correlation(rotated, MINOR);
    if (rMaj > bestR) {
      bestR = rMaj;
      best = { tonic, mode: 'major', fifths: MAJOR_FIFTHS[tonic]! };
    }
    if (rMin > bestR) {
      bestR = rMin;
      // La relativa mayor está una tercera menor arriba.
      best = { tonic, mode: 'minor', fifths: MAJOR_FIFTHS[(tonic + 3) % 12]! };
    }
  }
  return best;
}

const SHARP_NAMES = ['C', 'C', 'D', 'D', 'E', 'F', 'F', 'G', 'G', 'A', 'A', 'B'];
const SHARP_ALTER = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];
const FLAT_NAMES = ['C', 'D', 'D', 'E', 'E', 'F', 'G', 'G', 'A', 'A', 'B', 'B'];
const FLAT_ALTER = [0, -1, 0, -1, 0, 0, -1, 0, -1, 0, -1, 0];

/** Nombre de la nota según la armadura: con bemoles si la armadura es de bemoles. */
export function spell(
  pitch: number,
  fifths: number,
): { step: string; alter: number; octave: number } {
  const pc = ((pitch % 12) + 12) % 12;
  const flats = fifths < 0;
  return {
    step: (flats ? FLAT_NAMES : SHARP_NAMES)[pc]!,
    alter: (flats ? FLAT_ALTER : SHARP_ALTER)[pc]!,
    octave: Math.floor(pitch / 12) - 1,
  };
}
