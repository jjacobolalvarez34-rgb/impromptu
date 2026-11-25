import type { NoteEvent } from '@impromptu/core';
import { noteColor } from './scene';
import type { VisualSettings } from './scene';

/**
 * De dónde sale el color de cada nota (pedido 65, panel de colores de SeeMusic que mostró
 * Jacobo). El estilo de la nota no decide el color (regla de Jacobo, pedido 64).
 */
export const MODOS_COLOR = [
  'mano',
  'division',
  'pista',
  'canal',
  'nota12',
  'degradado',
  'azar',
] as const;
export type ModoColor = (typeof MODOS_COLOR)[number];

/** Un color por nota de la escala (Do, Do#, Re…), dando la vuelta al círculo de color. */
export const ARCOIRIS_12: readonly string[] = [
  '#FF3B30',
  '#FF7A1A',
  '#FFB01F',
  '#FFE11A',
  '#B6F01E',
  '#3BDC4A',
  '#1FD6A8',
  '#1FC8F0',
  '#2F7BFF',
  '#5B4BFF',
  '#A64BFF',
  '#F03FC8',
];

/** Colores para pistas, canales o al azar, después de los de las dos manos. */
export const PALETA_EXTRA: readonly string[] = [
  '#19E6B0',
  '#FF4FD8',
  '#3AA8FF',
  '#FFC860',
  '#A070FF',
  '#FF5A36',
  '#B6F01E',
  '#EAF2FF',
];

export interface AjustesColor {
  modo: ModoColor;
  /** Tecla MIDI que separa las dos manos en el modo "división" (de ella para arriba, derecha). */
  division: number;
  colores: VisualSettings['colors'];
  /** Rango del teclado, para el degradado. */
  rango: { low: number; high: number };
}

function hexRgb(h: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(h.trim());
  const n = m ? parseInt(m[1]!, 16) : 0x9a968c;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function aHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.round(v).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

/** Mezcla lineal entre dos colores (k de 0 a 1). */
export function mezclar(a: string, b: string, k: number): string {
  const x = hexRgb(a);
  const y = hexRgb(b);
  const t = Math.max(0, Math.min(1, k));
  return aHex(x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t);
}

function hash(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Color de un grupo (pista o canal): los dos primeros son los de las manos; luego la paleta. */
function deGrupo(i: number, colores: VisualSettings['colors']): string {
  if (i <= 0) return colores.right;
  if (i === 1) return colores.left;
  return PALETA_EXTRA[(i - 2) % PALETA_EXTRA.length]!;
}

/** El color de una nota según el modo elegido. `pista` es el número de pista de la nota. */
export function colorSegunModo(note: NoteEvent, ajustes: AjustesColor, pista = 0): string {
  const { colores } = ajustes;
  switch (ajustes.modo) {
    case 'division':
      return note.pitch >= ajustes.division ? colores.right : colores.left;
    case 'pista':
      return deGrupo(pista, colores);
    case 'canal':
      return deGrupo(note.channel ?? 0, colores);
    case 'nota12':
      return ARCOIRIS_12[((note.pitch % 12) + 12) % 12]!;
    case 'degradado': {
      const { low, high } = ajustes.rango;
      // Graves con el color de la izquierda, agudos con el de la derecha.
      return mezclar(colores.left, colores.right, (note.pitch - low) / Math.max(1, high - low));
    }
    case 'azar':
      return PALETA_EXTRA[hash(note.id) % PALETA_EXTRA.length]!;
    case 'mano':
    default:
      return noteColor(note, colores);
  }
}
