import type { Finger, Hand, NoteEvent } from '@impromptu/core';

/**
 * Digitación sugerida (ROADMAP fase 4, ADR-012): programación dinámica (Viterbi) sobre los
 * dedos de cada nota, con el costo de pasar de una posición a otra.
 *
 * Las distancias cómodas entre pares de dedos (en semitonos, mano derecha) son las del
 * modelo de Parncutt, Sloboda, Clarke, Raekallio y Desain (1997), "An ergonomic model of
 * keyboard fingering for melodic fragments". Es un algoritmo propio sobre datos publicados,
 * no un puerto de código de terceros.
 */

export type HandSize = 'small' | 'medium' | 'large';

export interface FingeringOptions {
  handSize?: HandSize;
}

/** [MinPrac, MinComf, MinRel, MaxRel, MaxComf, MaxPrac] para el par (dedo a → dedo b). */
type Span = [number, number, number, number, number, number];
const SPANS: Readonly<Record<string, Span>> = {
  '1-2': [-5, -3, 1, 5, 8, 10],
  '1-3': [-4, -2, 3, 7, 10, 12],
  '1-4': [-3, -1, 5, 9, 12, 14],
  '1-5': [-1, 1, 7, 10, 13, 15],
  '2-3': [1, 1, 1, 2, 3, 5],
  '2-4': [1, 1, 3, 4, 5, 7],
  '2-5': [2, 2, 5, 6, 8, 10],
  '3-4': [1, 1, 1, 2, 2, 4],
  '3-5': [1, 1, 3, 4, 5, 7],
  '4-5': [1, 1, 1, 2, 3, 5],
};

const SIZE_SCALE: Record<HandSize, number> = { small: 0.85, medium: 1, large: 1.15 };
const FINGERS: readonly Finger[] = [1, 2, 3, 4, 5];
const IMPOSSIBLE = 1000;
const isBlack = (p: number) => [1, 3, 6, 8, 10].includes(((p % 12) + 12) % 12);

/**
 * Costo de tocar `p2` con `f2` justo después de `p1` con `f1`, para la mano derecha
 * (la izquierda se calcula reflejando los intervalos).
 */
export function transitionCost(
  f1: Finger,
  p1: number,
  f2: Finger,
  p2: number,
  hand: Hand,
  size: HandSize = 'medium',
): number {
  const d0 = hand === 'R' ? p2 - p1 : p1 - p2;
  if (f1 === f2) return p1 === p2 ? 0 : 4 + Math.abs(d0) * 0.5; // mismo dedo en otra tecla
  const [a, b, d] = f1 < f2 ? [f1, f2, d0] : [f2, f1, -d0];
  const span = SPANS[`${a}-${b}`]!;
  const s = SIZE_SCALE[size];
  const [minPrac, minComf, minRel, maxRel, maxComf, maxPrac] = span.map((v) => v * s) as Span;
  if (d < minPrac || d > maxPrac) return IMPOSSIBLE;
  let cost = 0;
  if (d < minComf) cost += 2 * (minComf - d);
  else if (d > maxComf) cost += 2 * (d - maxComf);
  if (d < minRel) cost += minRel - d;
  else if (d > maxRel) cost += d - maxRel;
  // Pasar el pulgar por debajo o un dedo por encima del pulgar (distancia "negativa").
  if ((a === 1 || b === 1) && d < 0) cost += 1;
  return cost;
}

/** Costo de una nota sola según la tecla: pulgar o meñique en tecla negra. */
function placementCost(f: Finger, pitch: number): number {
  if (!isBlack(pitch)) return 0;
  if (f === 1) return 2;
  if (f === 5) return 1;
  return 0;
}

interface Step {
  notes: NoteEvent[]; // un acorde (o una nota), de grave a agudo
  options: Finger[][]; // dedos posibles para cada nota del acorde
}

/**
 * Sugiere dedos para las notas de una mano. Las que tengan dedo fijado por el usuario
 * (fingerSource 'user') quedan como anclas y la digitación se recalcula alrededor.
 */
export function suggestFingering(
  notes: readonly NoteEvent[],
  hand: Hand,
  options: FingeringOptions = {},
): NoteEvent[] {
  const size = options.handSize ?? 'medium';
  const sorted = [...notes].sort((a, b) => a.start - b.start || a.pitch - b.pitch);
  if (sorted.length === 0) return [];

  // Agrupar en acordes y listar las combinaciones de dedos posibles para cada uno.
  const steps: Step[] = [];
  for (let i = 0; i < sorted.length;) {
    let j = i + 1;
    while (j < sorted.length && sorted[j]!.start - sorted[i]!.start < 0.035) j++;
    const chord = sorted
      .slice(i, j)
      .sort((a, b) => a.pitch - b.pitch)
      .slice(0, 5);
    i = j;
    steps.push({ notes: chord, options: chordOptions(chord, hand) });
  }

  // Viterbi: costo acumulado de cada opción de cada paso.
  const costs: number[][] = [];
  const back: number[][] = [];
  steps.forEach((step, k) => {
    costs.push([]);
    back.push([]);
    step.options.forEach((fingers, o) => {
      const own = ownCost(step.notes, fingers, hand, size);
      if (k === 0) {
        costs[0]![o] = own;
        back[0]![o] = -1;
        return;
      }
      const prev = steps[k - 1]!;
      let best = Infinity;
      let arg = 0;
      prev.options.forEach((pf, po) => {
        const c = costs[k - 1]![po]! + linkCost(prev.notes, pf, step.notes, fingers, hand, size);
        if (c < best) {
          best = c;
          arg = po;
        }
      });
      costs[k]![o] = best + own;
      back[k]![o] = arg;
    });
  });

  // Recorrer hacia atrás la mejor secuencia.
  const chosen: number[] = new Array(steps.length);
  const last = costs[steps.length - 1]!;
  chosen[steps.length - 1] = last.indexOf(Math.min(...last));
  for (let k = steps.length - 1; k > 0; k--) chosen[k - 1] = back[k]![chosen[k]!]!;

  const byId = new Map<string, NoteEvent>();
  steps.forEach((step, k) => {
    const fingers = step.options[chosen[k]!]!;
    step.notes.forEach((n, idx) => {
      byId.set(
        n.id,
        n.fingerSource === 'user' ? n : { ...n, finger: fingers[idx]!, fingerSource: 'auto' },
      );
    });
  });
  return notes.map((n) => byId.get(n.id) ?? n);
}

/** Combinaciones de dedos para un acorde, en orden (derecha: del 1 al 5 subiendo). */
function chordOptions(chord: readonly NoteEvent[], hand: Hand): Finger[][] {
  const out: Finger[][] = [];
  const pick = (start: number, acc: Finger[]) => {
    if (acc.length === chord.length) {
      const fingers = hand === 'R' ? acc : [...acc].reverse();
      // Respetar dedos fijados por el usuario.
      if (chord.every((n, i) => n.fingerSource !== 'user' || n.finger === fingers[i]))
        out.push(fingers);
      return;
    }
    for (let f = start; f < FINGERS.length; f++) pick(f + 1, [...acc, FINGERS[f]!]);
  };
  // La izquierda numera al revés (de grave a agudo va 5 → 1): ya invertido arriba.
  pick(0, []);
  return out.length > 0 ? out : [chord.map((n) => n.finger ?? 1)];
}

function ownCost(
  chord: readonly NoteEvent[],
  fingers: readonly Finger[],
  hand: Hand,
  size: HandSize,
): number {
  let cost = 0;
  chord.forEach((n, i) => (cost += placementCost(fingers[i]!, n.pitch)));
  // Apertura dentro del acorde: cada par vecino debe ser cómodo.
  for (let i = 1; i < chord.length; i++) {
    // En un acorde, la distancia entre dedos sigue a la de las notas: una tercera salta un
    // dedo (Do-Mi-Sol → 1-3-5), una segunda usa dedos vecinos.
    const interval = Math.abs(chord[i]!.pitch - chord[i - 1]!.pitch);
    const expectedGap = Math.min(4, Math.max(1, Math.round(interval / 2)));
    cost += 0.4 * Math.abs(Math.abs(fingers[i]! - fingers[i - 1]!) - expectedGap);
    cost +=
      transitionCost(
        fingers[i - 1]!,
        chord[i - 1]!.pitch,
        fingers[i]!,
        chord[i]!.pitch,
        hand,
        size,
      ) * 0.5;
  }
  return cost;
}

function linkCost(
  a: readonly NoteEvent[],
  fa: readonly Finger[],
  b: readonly NoteEvent[],
  fb: readonly Finger[],
  hand: Hand,
  size: HandSize,
): number {
  // Se compara la nota más aguda (derecha) o la más grave (izquierda) de cada acorde: la que guía.
  const ia = hand === 'R' ? a.length - 1 : 0;
  const ib = hand === 'R' ? b.length - 1 : 0;
  let cost = transitionCost(fa[ia]!, a[ia]!.pitch, fb[ib]!, b[ib]!.pitch, hand, size);
  // Mismo dedo en otra tecla entre notas que se tocan casi juntas: casi imposible.
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      if (fa[i] === fb[j] && a[i]!.pitch !== b[j]!.pitch && b[j]!.start - a[i]!.end < 0.05)
        cost += 6;
    }
  }
  return cost;
}
