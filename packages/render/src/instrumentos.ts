import { AFINACIONES, PIEZAS_BATERIA, asignarTrastes, piezaDeNota } from '@impromptu/core';
import type { Instrument, NoteEvent, Take, Track } from '@impromptu/core';
import type { KeyRect, KeyboardLayout } from './keyboard-layout';

/**
 * Carriles para guitarra y batería (fase 9). El visualizador ubica cada nota en una "tecla"; aquí
 * esas teclas son virtuales:
 * - Guitarra y bajo: un carril por traste y, dentro, una línea fina por cuerda. La nota cae justo
 *   donde se pisa, con el número de traste y el color de su cuerda.
 * - Batería: un carril por pieza del kit, que cae sobre su parche.
 */

/** Colores por cuerda (1 aguda … 6 grave), afines al tema ámbar. */
export const COLOR_CUERDA = ['#FF9F1C', '#FFD27A', '#E8E4DC', '#7FD1B9', '#6FA8FF', '#C58BFF'];

/** Colores por pieza de batería, en el orden de PIEZAS_BATERIA. */
export const COLOR_PIEZA = [
  '#9A968C',
  '#FF9F1C',
  '#C58BFF',
  '#E8E4DC',
  '#6FA8FF',
  '#7FD1B9',
  '#FFD27A',
  '#F2C14E',
  '#FF6B3D',
];

export interface Carriles {
  instrument: Exclude<Instrument, 'piano'>;
  layout: KeyboardLayout;
  /** Notas con la altura cambiada por su carril virtual (mismo id que la original). */
  notas: NoteEvent[];
  /** Por id: texto sobre la nota y su color. */
  meta: Map<string, { etiqueta: string; color: string }>;
  /** Guitarra: trastes visibles (0 = al aire) y cuerdas. Batería: piezas. */
  trastes: number;
  cuerdas: number;
}

/** Instrumento principal de una toma: el que tiene notas, prefiriendo el piano. */
export function instrumentoDe(take: Take | null): Instrument {
  const con = (take?.tracks ?? []).filter((t) => t.notes.length > 0);
  if (con.length === 0 || con.some((t) => t.instrument === 'piano')) return 'piano';
  return con[0]!.instrument;
}

function teclas(n: number, ancho: (i: number) => [number, number]): KeyboardLayout {
  const keys: KeyRect[] = Array.from({ length: n }, (_, i) => {
    const [x, width] = ancho(i);
    return { pitch: i, black: false, x, width };
  });
  return { range: { low: 0, high: n - 1 }, whiteCount: n, keys, key: (p) => keys[p] };
}

/** Carriles de guitarra o bajo: se completan cuerda y traste si faltan. */
export function carrilesCuerdas(tracks: readonly Track[], instrument: 'guitar' | 'bass'): Carriles {
  const afinacion = instrument === 'bass' ? AFINACIONES.bajo : AFINACIONES.estandar;
  const cuerdas = afinacion.length;
  const originales = tracks.filter((t) => t.instrument === instrument).flatMap((t) => t.notes);
  const conTraste = asignarTrastes(originales, afinacion);
  const maxTraste = conTraste.reduce((m, n) => Math.max(m, n.fret ?? 0), 0);
  const trastes = Math.min(22, Math.max(12, maxTraste + 2)) + 1; // columnas, con el 0 (al aire)
  const col = 1 / trastes;
  const sub = col / cuerdas;
  const layout = teclas(trastes * cuerdas, (i) => {
    const traste = Math.floor(i / cuerdas);
    const cuerda = (i % cuerdas) + 1;
    // Dentro del traste: la grave a la izquierda y la aguda a la derecha.
    return [traste * col + (cuerdas - cuerda) * sub, sub];
  });
  const meta = new Map<string, { etiqueta: string; color: string }>();
  const notas: NoteEvent[] = [];
  for (const n of conTraste) {
    if (n.string === undefined || n.fret === undefined) continue;
    notas.push({ ...n, pitch: n.fret * cuerdas + (n.string - 1) });
    meta.set(n.id, { etiqueta: String(n.fret), color: COLOR_CUERDA[(n.string - 1) % 6]! });
  }
  notas.sort((a, b) => a.start - b.start);
  return { instrument, layout, notas, meta, trastes, cuerdas };
}

/** Carriles de batería: uno por pieza; el parche brilla 0,12 s con cada golpe. */
export function carrilesBateria(tracks: readonly Track[]): Carriles {
  const n = PIEZAS_BATERIA.length;
  const layout = teclas(n, (i) => [i / n, 1 / n]);
  const meta = new Map<string, { etiqueta: string; color: string }>();
  const notas: NoteEvent[] = [];
  for (const nota of tracks.filter((t) => t.instrument === 'drums').flatMap((t) => t.notes)) {
    const pieza = piezaDeNota(nota.pitch);
    if (!pieza) continue;
    const i = PIEZAS_BATERIA.indexOf(pieza);
    notas.push({ ...nota, pitch: i, end: nota.start + 0.12 });
    meta.set(nota.id, { etiqueta: pieza.nombre.slice(0, 1), color: COLOR_PIEZA[i]! });
  }
  notas.sort((a, b) => a.start - b.start);
  return { instrument: 'drums', layout, notas, meta, trastes: n, cuerdas: 0 };
}

export function carriles(tracks: readonly Track[], instrument: Instrument): Carriles | null {
  if (instrument === 'guitar' || instrument === 'bass') return carrilesCuerdas(tracks, instrument);
  if (instrument === 'drums') return carrilesBateria(tracks);
  return null;
}
