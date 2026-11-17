import type { NoteEvent, PedalEvent, PedalKind, Track, VisualProject } from '@impromptu/core';
import { pedalValueAt } from '@impromptu/core';
import type { KeyboardLayout } from './keyboard-layout';
import { BLACK_LENGTH } from './keyboard-layout';

/** Lo que el visualizador necesita de un VisualProject. */
export type VisualSettings = Pick<
  VisualProject,
  'themeId' | 'effects' | 'show' | 'colors' | 'layout' | 'background'
>;

/** Segundos que tarda una nota en caer de arriba a la línea con fallSpeed = 1. */
export const BASE_LOOKAHEAD = 3;

export interface FrameLayout {
  width: number;
  height: number;
  /** Línea donde aterrizan las notas (borde superior del teclado). */
  keyLineY: number;
  keyboardHeight: number;
  blackKeyHeight: number;
  /** Franja del pedal bajo el teclado. */
  pedalY: number;
  pedalHeight: number;
  /** Píxeles por segundo de caída. */
  pps: number;
}

export function frameLayout(width: number, height: number, fallSpeed: number): FrameLayout {
  const pedalHeight = Math.round(Math.max(14, height * 0.03));
  const keyboardHeight = Math.round(Math.min(Math.max(height * 0.15, 48), width * 0.12));
  const keyLineY = height - pedalHeight - keyboardHeight;
  const lookahead = BASE_LOOKAHEAD / Math.max(0.1, fallSpeed);
  return {
    width,
    height,
    keyLineY,
    keyboardHeight,
    blackKeyHeight: Math.round(keyboardHeight * BLACK_LENGTH),
    pedalY: keyLineY + keyboardHeight,
    pedalHeight,
    pps: keyLineY / lookahead,
  };
}

/** Notas de todas las pistas, ordenadas por inicio, con la duración máxima para buscar rápido. */
export interface NoteIndex {
  notes: NoteEvent[];
  maxDuration: number;
}

export function indexNotes(tracks: readonly Track[]): NoteIndex {
  const notes = tracks
    .flatMap((t) => t.notes)
    .sort((a, b) => a.start - b.start || a.pitch - b.pitch);
  let maxDuration = 0;
  for (const n of notes) maxDuration = Math.max(maxDuration, n.end - n.start);
  return { notes, maxDuration };
}

/** Primer índice con start ≥ time (búsqueda binaria). */
function lowerBound(notes: readonly NoteEvent[], time: number): number {
  let lo = 0;
  let hi = notes.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (notes[mid]!.start < time) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** Llama `fn` con cada nota que se solapa con [from, to]. Sin crear arreglos (BUGS B-013). */
export function forEachNoteIn(
  index: NoteIndex,
  from: number,
  to: number,
  fn: (note: NoteEvent) => void,
): void {
  const { notes } = index;
  for (let i = lowerBound(notes, from - index.maxDuration); i < notes.length; i++) {
    const n = notes[i]!;
    if (n.start > to) break;
    if (n.end >= from) fn(n);
  }
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 'fall': las notas caen hacia el teclado (reproducir una toma).
 * 'rise': nacen en la tecla y suben mientras se toca (en vivo: no se conoce el futuro).
 */
export type Direction = 'fall' | 'rise';

/**
 * Rectángulo de una nota en el instante t, recortado en la línea de aterrizaje.
 * Null si no se ve (aún no entra, ya terminó o su tecla no está en el teclado).
 * En 'rise' una nota que sigue abajo (end = Infinity) crece desde la tecla.
 */
export function noteRect(
  note: NoteEvent,
  t: number,
  layout: FrameLayout,
  keyboard: KeyboardLayout,
  minHeight = 3,
  direction: Direction = 'fall',
): Rect | null {
  const key = keyboard.key(note.pitch);
  if (!key) return null;
  const line = layout.keyLineY;
  const bottom =
    direction === 'fall'
      ? Math.min(line, line - (note.start - t) * layout.pps)
      : line - Math.max(0, t - note.end) * layout.pps;
  const top =
    direction === 'fall'
      ? line - (note.end - t) * layout.pps
      : line - (t - note.start) * layout.pps;
  if (bottom <= 0 || top >= layout.keyLineY) return null;
  const y = Math.max(0, Math.min(top, bottom - minHeight));
  const gap = Math.max(1, key.width * layout.width * 0.08);
  return {
    x: key.x * layout.width + gap / 2,
    y,
    width: Math.max(1, key.width * layout.width - gap),
    height: bottom - y,
  };
}

export const isSounding = (note: NoteEvent, t: number) => note.start <= t && t < note.end;

/** Color de una nota según su mano y los colores elegidos por el usuario. */
export function noteColor(note: NoteEvent, colors: VisualSettings['colors']): string {
  if (note.hand === 'R') return colors.right;
  if (note.hand === 'L') return colors.left;
  return colors.unassigned;
}

/** Valor de cada pedal en t, entre 0 y 1 (medio pedal incluido). */
export function pedalLevels(pedals: readonly PedalEvent[], t: number): Record<PedalKind, number> {
  return {
    sustain: pedalValueAt(pedals, 'sustain', t) / 127,
    sostenuto: pedalValueAt(pedals, 'sostenuto', t) / 127,
    soft: pedalValueAt(pedals, 'soft', t) / 127,
  };
}
