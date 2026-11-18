import type { NoteEvent } from './model';

/**
 * Guitarra (fase 9): afinaciones y elección de cuerda y traste para cada nota. Una misma nota
 * se puede tocar en varias cuerdas; se elige el recorrido más cómodo para la mano (acordes
 * cerrados, pocas posiciones altas y saltos cortos), como haría un guitarrista. Cuerda 1 = la
 * más aguda (convención de la tablatura). Mismo cálculo en la app de Android (`Guitarra.kt`).
 */

/** Altura MIDI de cada cuerda al aire, de la 1 (aguda) a la 6 (grave). */
export const AFINACIONES = {
  estandar: [64, 59, 55, 50, 45, 40],
  'drop-d': [64, 59, 55, 50, 45, 38],
  'medio-tono-abajo': [63, 58, 54, 49, 44, 39],
  /** Bajo de 4 cuerdas. */
  bajo: [43, 38, 33, 28],
} as const satisfies Record<string, readonly number[]>;

export type Afinacion = keyof typeof AFINACIONES;

export const TRASTES = 22;

export interface Posicion {
  /** Cuerda: 1 la más aguda. */
  string: number;
  fret: number;
}

/** Dónde se puede tocar una nota (de la cuerda más aguda a la más grave). */
export function posiciones(
  pitch: number,
  afinacion: readonly number[] = AFINACIONES.estandar,
): Posicion[] {
  const out: Posicion[] = [];
  afinacion.forEach((aire, i) => {
    const fret = pitch - aire;
    if (fret >= 0 && fret <= TRASTES) out.push({ string: i + 1, fret });
  });
  return out;
}

/** Notas que suenan juntas (inicio a menos de 35 ms): un acorde o una nota sola. */
function agrupar(notas: readonly NoteEvent[]): NoteEvent[][] {
  const orden = [...notas].sort((a, b) => a.start - b.start || a.pitch - b.pitch);
  const grupos: NoteEvent[][] = [];
  for (const n of orden) {
    const g = grupos[grupos.length - 1];
    if (g && n.start - g[0]!.start < 0.035 && g.length < 6) g.push(n);
    else grupos.push([n]);
  }
  return grupos;
}

interface Forma {
  pos: (Posicion | null)[];
  costo: number;
  /** Trastes pisados (sin las cuerdas al aire). */
  pisados: number[];
}

/** La mano cubre 4 trastes (un dedo por traste) desde donde apoya el índice. */
const ALCANCE = 3;

/** Formas posibles de un acorde (cada nota en una cuerda distinta), las más cómodas primero. */
function formas(grupo: readonly NoteEvent[], afinacion: readonly number[], max = 40): Forma[] {
  const opciones = grupo.map((n) => posiciones(n.pitch, afinacion));
  const out: Forma[] = [];
  const actual: (Posicion | null)[] = [];
  const usadas = new Set<number>();
  const recorrer = (i: number) => {
    if (out.length > 4000) return;
    if (i === grupo.length) {
      const pisados = actual
        .filter((p): p is Posicion => p !== null && p.fret > 0)
        .map((p) => p.fret);
      const sinLugar = actual.filter((p) => p === null).length;
      const abertura = pisados.length ? Math.max(...pisados) - Math.min(...pisados) : 0;
      const alto = pisados.length ? pisados.reduce((a, b) => a + b, 0) / pisados.length : 0;
      const costo =
        sinLugar * 100 +
        (abertura > ALCANCE ? (abertura - ALCANCE) * 20 : 0) +
        alto * 0.2 -
        actual.filter((p) => p?.fret === 0).length * 0.5;
      out.push({ pos: [...actual], costo, pisados });
      return;
    }
    let alguna = false;
    for (const p of opciones[i]!) {
      if (usadas.has(p.string)) continue;
      alguna = true;
      usadas.add(p.string);
      actual.push(p);
      recorrer(i + 1);
      actual.pop();
      usadas.delete(p.string);
    }
    if (!alguna) {
      // Fuera del rango de la guitarra (o sin cuerda libre): queda sin posición.
      actual.push(null);
      recorrer(i + 1);
      actual.pop();
    }
  };
  recorrer(0);
  return out.sort((a, b) => a.costo - b.costo).slice(0, max);
}

/** Lugares de la mano (traste del índice) desde donde se alcanza la forma. */
function manosPara(f: Forma): number[] {
  if (f.pisados.length === 0) return [-1]; // todo al aire: la mano no importa
  const lo = Math.max(...f.pisados) - ALCANCE;
  const hi = Math.min(...f.pisados);
  const out: number[] = [];
  for (let h = Math.max(1, lo); h <= Math.max(1, hi); h++) out.push(h);
  return out;
}

/**
 * Asigna cuerda y traste a cada nota (devuelve notas nuevas; las que ya tenían cuerda y traste
 * puestos a mano se respetan). Programación dinámica sobre los acordes con la mano como estado:
 * moverse dentro de los 4 trastes que cubre la mano no cuesta; cambiar de posición sí.
 */
export function asignarTrastes(
  notas: readonly NoteEvent[],
  afinacion: readonly number[] = AFINACIONES.estandar,
): NoteEvent[] {
  const grupos = agrupar(notas);
  if (grupos.length === 0) return [];
  const candidatos = grupos.map((g): Forma[] => {
    const fijas = g.every((n) => n.string !== undefined && n.fret !== undefined);
    if (fijas) {
      const pos = g.map((n) => ({ string: n.string!, fret: n.fret! }));
      return [{ pos, costo: 0, pisados: pos.filter((p) => p.fret > 0).map((p) => p.fret) }];
    }
    return formas(g, afinacion);
  });
  // Estados: (forma, mano). Con todo al aire la mano se queda donde estaba (-1 = sin fijar).
  interface Estado {
    forma: number;
    mano: number;
    costo: number;
    previo: number;
  }
  const capas: Estado[][] = [];
  capas.push(
    candidatos[0]!.flatMap((f, k) =>
      manosPara(f).map((h) => ({ forma: k, mano: h, costo: f.costo, previo: -1 })),
    ),
  );
  for (let i = 1; i < grupos.length; i++) {
    const anterior = capas[i - 1]!;
    const capa: Estado[] = [];
    candidatos[i]!.forEach((f, k) => {
      for (const h of manosPara(f)) {
        let mejor = Infinity;
        let de = 0;
        let mano = h;
        anterior.forEach((e, j) => {
          const m = h === -1 ? e.mano : h;
          const mover = e.mano === -1 || m === -1 ? 0 : Math.abs(e.mano - m) * 2;
          const v = e.costo + f.costo + mover;
          if (v < mejor) {
            mejor = v;
            de = j;
            mano = m;
          }
        });
        capa.push({ forma: k, mano, costo: mejor, previo: de });
      }
    });
    capas.push(capa);
  }
  const ultima = capas[capas.length - 1]!;
  let j = ultima.reduce((m, e, i) => (e.costo < ultima[m]!.costo ? i : m), 0);
  const elegidas: Forma[] = [];
  for (let i = grupos.length - 1; i >= 0; i--) {
    const e = capas[i]![j]!;
    elegidas[i] = candidatos[i]![e.forma]!;
    j = e.previo;
  }
  const porId = new Map<string, Posicion | null>();
  grupos.forEach((g, i) => g.forEach((n, k) => porId.set(n.id, elegidas[i]!.pos[k] ?? null)));
  return notas.map((n) => {
    const p = porId.get(n.id);
    return p ? { ...n, string: p.string, fret: p.fret } : n;
  });
}
