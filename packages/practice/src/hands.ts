import type { Hand, NoteEvent } from '@impromptu/core';

/**
 * Separación automática de manos (ROADMAP fase 4): registro + continuidad + apertura máxima.
 *
 * Las notas se agrupan en acordes (ataques a menos de CHORD_WINDOW). Para cada acorde se
 * elige el punto de corte (notas graves → izquierda, agudas → derecha) que menos cuesta:
 * - distancia de cada mano a su posición reciente (continuidad de las voces),
 * - apertura de cada mano por encima de su máximo,
 * - manos cruzadas,
 * - una preferencia suave por la izquierda abajo y la derecha arriba del Do central.
 * Las notas con mano fijada por el usuario (handSource 'user') no se cambian y guían al resto.
 */

export interface HandOptions {
  /** Apertura máxima cómoda de una mano en semitonos (una novena por defecto). */
  maxSpan?: number;
  /** Nota que separa las manos cuando no hay más información (Do central). */
  split?: number;
}

const CHORD_WINDOW = 0.035;

export function separateHands(notes: readonly NoteEvent[], options: HandOptions = {}): NoteEvent[] {
  const maxSpan = options.maxSpan ?? 14;
  const split = options.split ?? 60;
  const sorted = [...notes].sort((a, b) => a.start - b.start || a.pitch - b.pitch);
  const result = new Map<string, NoteEvent>();

  // Posición reciente de cada mano (media móvil de las notas que tocó).
  let left = split - 12;
  let right = split + 7;

  for (let i = 0; i < sorted.length;) {
    let j = i + 1;
    while (j < sorted.length && sorted[j]!.start - sorted[i]!.start < CHORD_WINDOW) j++;
    const chord = sorted.slice(i, j).sort((a, b) => a.pitch - b.pitch);
    i = j;

    const fixed = chord.filter((n) => n.handSource === 'user' && n.hand);
    let bestCut = 0;
    let bestCost = Infinity;
    // cut = cuántas notas (de abajo) van a la izquierda.
    for (let cut = 0; cut <= chord.length; cut++) {
      const lows = chord.slice(0, cut);
      const highs = chord.slice(cut);
      // Respetar las manos que fijó el usuario.
      if (fixed.some((n) => (lows.includes(n) ? 'L' : 'R') !== n.hand)) continue;
      let cost = 0;
      if (lows.length > 0) {
        const lo = lows[0]!.pitch;
        const hi = lows[lows.length - 1]!.pitch;
        cost += Math.abs((lo + hi) / 2 - left) * 0.35;
        cost += Math.max(0, hi - lo - maxSpan) * 3;
        cost += Math.max(0, hi - split - 5) * 0.25; // la izquierda muy arriba es rara
      }
      if (highs.length > 0) {
        const lo = highs[0]!.pitch;
        const hi = highs[highs.length - 1]!.pitch;
        cost += Math.abs((lo + hi) / 2 - right) * 0.35;
        cost += Math.max(0, hi - lo - maxSpan) * 3;
        cost += Math.max(0, split - 5 - lo) * 0.25; // la derecha muy abajo es rara
      }
      // Manos cruzadas: la izquierda tocando por encima de donde está la derecha.
      if (lows.length > 0 && highs.length === 0)
        cost += Math.max(0, lows[lows.length - 1]!.pitch - right) * 0.6;
      if (highs.length > 0 && lows.length === 0) cost += Math.max(0, left - highs[0]!.pitch) * 0.6;
      if (cost < bestCost) {
        bestCost = cost;
        bestCut = cut;
      }
    }

    const lows = chord.slice(0, bestCut);
    const highs = chord.slice(bestCut);
    for (const [group, hand] of [
      [lows, 'L'],
      [highs, 'R'],
    ] as const) {
      for (const n of group) {
        const keep = n.handSource === 'user' && n.hand !== null;
        result.set(n.id, keep ? n : { ...n, hand: hand as Hand, handSource: 'auto' });
      }
    }
    if (lows.length > 0) left = left * 0.6 + avg(lows) * 0.4;
    if (highs.length > 0) right = right * 0.6 + avg(highs) * 0.4;
  }

  return notes.map((n) => result.get(n.id) ?? n);
}

const avg = (notes: readonly NoteEvent[]) => notes.reduce((s, n) => s + n.pitch, 0) / notes.length;
