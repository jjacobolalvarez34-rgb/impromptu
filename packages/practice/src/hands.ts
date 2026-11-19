import type { Hand, NoteEvent } from '@impromptu/core';

/**
 * Separación automática de manos (ROADMAP fase 4; mejorada el 2026-11-19, pedido 36 de Jacobo).
 *
 * Las notas se agrupan en acordes (ataques a menos de CHORD_WINDOW). En cada acorde, un corte
 * decide qué notas (de abajo) van a la izquierda y cuáles a la derecha. Antes se elegía el mejor
 * corte acorde por acorde, sin mirar adelante; ahora se buscan los mejores CAMINOS completos
 * (búsqueda en haz): se guardan las mejores alternativas y al final gana la de menor costo total,
 * así una decisión que parecía buena pero obliga a cruzar o saltar después se corrige.
 *
 * Costo de cada corte:
 * - distancia de cada mano a su posición reciente (continuidad), menos importante tras un
 *   silencio largo (la mano tuvo tiempo de moverse),
 * - apertura de cada mano por encima de su máximo, contando las notas que esa mano TODAVÍA
 *   SOSTIENE (una mano con un acorde apretado no alcanza una nota lejana),
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
/** Cuántas alternativas se guardan en cada acorde. */
const HAZ = 24;

interface Estado {
  left: number;
  right: number;
  /** Cuándo tocó por última vez cada mano (para abaratar el salto tras un silencio). */
  tLeft: number;
  tRight: number;
  /** Notas que cada mano sigue sosteniendo. */
  sostL: readonly NoteEvent[];
  sostR: readonly NoteEvent[];
  /** Última nota suelta y su mano: una línea melódica sigue en la misma mano. */
  linea: { pitch: number; hand: Hand } | null;
  costo: number;
  corte: number;
  previo: Estado | null;
}

export function separateHands(notes: readonly NoteEvent[], options: HandOptions = {}): NoteEvent[] {
  const maxSpan = options.maxSpan ?? 14;
  const split = options.split ?? 60;
  const sorted = [...notes].sort((a, b) => a.start - b.start || a.pitch - b.pitch);

  const acordes: NoteEvent[][] = [];
  for (let i = 0; i < sorted.length;) {
    let j = i + 1;
    while (j < sorted.length && sorted[j]!.start - sorted[i]!.start < CHORD_WINDOW) j++;
    acordes.push(sorted.slice(i, j).sort((a, b) => a.pitch - b.pitch));
    i = j;
  }

  let haz: Estado[] = [
    {
      left: split - 12,
      right: split + 7,
      tLeft: -Infinity,
      tRight: -Infinity,
      sostL: [],
      sostR: [],
      linea: null,
      costo: 0,
      corte: 0,
      previo: null,
    },
  ];

  for (const chord of acordes) {
    const t = chord[0]!.start;
    const fixed = chord.filter((n) => n.handSource === 'user' && n.hand);
    const siguientes: Estado[] = [];
    for (const e of haz) {
      const sostL = e.sostL.filter((n) => n.end > t + 0.02);
      const sostR = e.sostR.filter((n) => n.end > t + 0.02);
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
          const libre = 1 / (1 + Math.max(0, t - e.tLeft) / 0.6);
          cost += Math.abs((lo + hi) / 2 - e.left) * (0.15 + 0.2 * libre);
          cost += Math.max(0, alcance(lows, sostL) - maxSpan) * 3;
          cost += Math.max(0, hi - split - 5) * 0.25; // la izquierda muy arriba es rara
        }
        if (highs.length > 0) {
          const lo = highs[0]!.pitch;
          const hi = highs[highs.length - 1]!.pitch;
          const libre = 1 / (1 + Math.max(0, t - e.tRight) / 0.6);
          cost += Math.abs((lo + hi) / 2 - e.right) * (0.15 + 0.2 * libre);
          cost += Math.max(0, alcance(highs, sostR) - maxSpan) * 3;
          cost += Math.max(0, split - 5 - lo) * 0.25; // la derecha muy abajo es rara
        }
        // Línea melódica: una nota suelta cerca de la anterior sigue en la misma mano.
        const suelta = chord.length === 1 ? chord[0]! : null;
        if (suelta && e.linea && Math.abs(suelta.pitch - e.linea.pitch) <= 4) {
          if ((cut === 1 ? 'L' : 'R') !== e.linea.hand) cost += 4;
        }
        // Manos cruzadas: la izquierda tocando por encima de donde está la derecha.
        if (lows.length > 0 && highs.length === 0)
          cost += Math.max(0, lows[lows.length - 1]!.pitch - e.right) * 0.6;
        if (highs.length > 0 && lows.length === 0)
          cost += Math.max(0, e.left - highs[0]!.pitch) * 0.6;
        siguientes.push({
          left: lows.length > 0 ? e.left * 0.6 + avg(lows) * 0.4 : e.left,
          right: highs.length > 0 ? e.right * 0.6 + avg(highs) * 0.4 : e.right,
          tLeft: lows.length > 0 ? t : e.tLeft,
          tRight: highs.length > 0 ? t : e.tRight,
          sostL: lows.length > 0 ? [...sostL, ...lows] : sostL,
          sostR: highs.length > 0 ? [...sostR, ...highs] : sostR,
          linea: suelta ? { pitch: suelta.pitch, hand: cut === 1 ? 'L' : 'R' } : null,
          costo: e.costo + cost,
          corte: cut,
          previo: e,
        });
      }
    }
    // Se quedan las mejores; dos estados con las manos casi en el mismo lugar cuentan como uno.
    siguientes.sort((a, b) => a.costo - b.costo);
    const vistos = new Set<string>();
    haz = [];
    for (const e of siguientes) {
      const clave = `${Math.round(e.left)}:${Math.round(e.right)}:${e.sostL.length}:${e.sostR.length}`;
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      haz.push(e);
      if (haz.length >= HAZ) break;
    }
  }

  // Del mejor camino, hacia atrás: el corte de cada acorde.
  const cortes: number[] = [];
  for (let e: Estado | null = haz[0] ?? null; e?.previo; e = e.previo) cortes.push(e.corte);
  cortes.reverse();

  const result = new Map<string, NoteEvent>();
  acordes.forEach((chord, k) => {
    const cut = cortes[k] ?? 0;
    chord.forEach((n, i) => {
      const keep = n.handSource === 'user' && n.hand !== null;
      const hand: Hand = i < cut ? 'L' : 'R';
      result.set(n.id, keep ? n : { ...n, hand, handSource: 'auto' });
    });
  });
  return notes.map((n) => result.get(n.id) ?? n);
}

/** Apertura de la mano: de su nota más grave a la más aguda, contando lo que sigue sosteniendo. */
function alcance(nuevas: readonly NoteEvent[], sostenidas: readonly NoteEvent[]): number {
  let lo = Infinity;
  let hi = -Infinity;
  for (const n of nuevas) {
    lo = Math.min(lo, n.pitch);
    hi = Math.max(hi, n.pitch);
  }
  for (const n of sostenidas) {
    lo = Math.min(lo, n.pitch);
    hi = Math.max(hi, n.pitch);
  }
  return hi - lo;
}

const avg = (notes: readonly NoteEvent[]) => notes.reduce((s, n) => s + n.pitch, 0) / notes.length;
