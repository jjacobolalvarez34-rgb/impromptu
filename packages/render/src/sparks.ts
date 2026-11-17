import type { NoteEvent } from '@impromptu/core';

/**
 * Chispas sin estado: cada partícula se calcula solo con t y una semilla que sale de
 * la nota (tecla y ataque). Mismo t = mismas chispas, en vivo y al exportar (BUGS B-012).
 */

export interface Spark {
  x: number;
  y: number;
  size: number;
  alpha: number;
}

/** Vida máxima de una chispa en segundos. */
export const SPARK_LIFE = 0.7;
/** Mientras la tecla sigue abajo, nace una ráfaga pequeña cada tanto. */
const EMIT_EVERY = 0.09;
const GRAVITY = 900; // px/s² hacia abajo (en píxeles de un cuadro de 1080 de alto)

/** Generador pseudoaleatorio pequeño y rápido (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** Semilla estable de una ráfaga: misma nota y misma ráfaga dan la misma semilla. */
export function burstSeed(note: Pick<NoteEvent, 'pitch' | 'start'>, burst: number): number {
  let h = 2166136261;
  for (const v of [note.pitch, Math.round(note.start * 1000), burst]) {
    h ^= v;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface SparkOptions {
  /** 0–100, del deslizador "Chispas al tocar". */
  amount: number;
  /** Centro horizontal de la tecla y línea de aterrizaje, en px. */
  originX: number;
  originY: number;
  keyWidth: number;
  /** Escala respecto a un cuadro de 1080 px de alto. */
  scale: number;
}

/** Añade a `out` las chispas vivas de una nota en el instante t. */
export function noteSparks(note: NoteEvent, t: number, opts: SparkOptions, out: Spark[]): void {
  if (opts.amount <= 0 || t < note.start) return;
  const heldUntil = Math.min(note.end, t);
  const perBurst = Math.round((opts.amount / 100) * (3 + (note.velocity / 127) * 7));
  if (perBurst === 0) return;

  const firstBurst = Math.max(0, Math.ceil((t - SPARK_LIFE - note.start) / EMIT_EVERY));
  const lastBurst = Math.floor((heldUntil - note.start) / EMIT_EVERY);
  for (let b = firstBurst; b <= lastBurst; b++) {
    const born = note.start + b * EMIT_EVERY;
    const age = t - born;
    if (age < 0 || age > SPARK_LIFE) continue;
    const random = rng(burstSeed(note, b));
    // La primera ráfaga (el ataque) es más fuerte que las de la tecla sostenida.
    const count = b === 0 ? perBurst * 2 : Math.ceil(perBurst / 3);
    for (let i = 0; i < count; i++) {
      const life = SPARK_LIFE * (0.45 + 0.55 * random());
      const angle = -Math.PI / 2 + (random() - 0.5) * 1.6;
      const speed = (180 + 420 * random()) * (0.6 + 0.4 * (note.velocity / 127)) * opts.scale;
      const x0 = opts.originX + (random() - 0.5) * opts.keyWidth;
      const size = (1.5 + 2 * random()) * opts.scale;
      if (age > life) continue;
      out.push({
        x: x0 + Math.cos(angle) * speed * age,
        y: opts.originY + Math.sin(angle) * speed * age + 0.5 * GRAVITY * opts.scale * age * age,
        size,
        alpha: 1 - age / life,
      });
    }
  }
}
