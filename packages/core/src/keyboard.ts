import type { Take } from './model';

export type KeyboardRange = Take['keyboardRange'];
export type KeyboardSize = 61 | 76 | 88;

/** Rangos estándar: 61 (C2–C7, PSR-E343), 76 (E1–G7) y 88 (A0–C8). */
export const KEYBOARD_PRESETS: Readonly<Record<KeyboardSize, KeyboardRange>> = {
  61: { low: 36, high: 96 },
  76: { low: 28, high: 103 },
  88: { low: 21, high: 108 },
};

export function keyCount(range: KeyboardRange): number {
  return range.high - range.low + 1;
}

/**
 * Teclado estándar más pequeño que contiene todas las notas (BUGS B-015).
 * Si hay notas fuera de un piano de 88 teclas, amplía el rango para no perderlas.
 */
export function fitKeyboardRange(pitches: Iterable<number>): KeyboardRange {
  let low = Infinity;
  let high = -Infinity;
  for (const p of pitches) {
    if (p < low) low = p;
    if (p > high) high = p;
  }
  if (low === Infinity) return { ...KEYBOARD_PRESETS[61] };
  for (const size of [61, 76, 88] as const) {
    const r = KEYBOARD_PRESETS[size];
    if (low >= r.low && high <= r.high) return { ...r };
  }
  return { low: Math.min(low, 21), high: Math.max(high, 108) };
}

/** Cuántas notas quedan fuera de un rango (para avisar al usuario). */
export function countOutOfRange(pitches: Iterable<number>, range: KeyboardRange): number {
  let n = 0;
  for (const p of pitches) if (p < range.low || p > range.high) n++;
  return n;
}
