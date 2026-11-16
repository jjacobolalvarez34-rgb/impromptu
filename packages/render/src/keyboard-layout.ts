import type { KeyboardRange } from '@impromptu/core';

/** Clases de nota negras: C#, D#, F#, G#, A#. */
const BLACK = new Set([1, 3, 6, 8, 10]);

/**
 * Corrimiento del centro de cada tecla negra respecto a la unión de sus dos blancas,
 * en anchos de tecla blanca. En un piano real no están centradas (BUGS B-014):
 * C# y F# van a la izquierda, D# y A# a la derecha, G# al centro.
 */
const BLACK_OFFSET: Readonly<Record<number, number>> = {
  1: -0.1,
  3: 0.1,
  6: -0.12,
  8: 0,
  10: 0.12,
};

/** Ancho de la tecla negra respecto a la blanca y largo respecto al alto del teclado. */
export const BLACK_WIDTH = 0.58;
export const BLACK_LENGTH = 0.63;

export interface KeyRect {
  pitch: number;
  black: boolean;
  /** Borde izquierdo, normalizado 0–1 respecto al ancho del teclado. */
  x: number;
  /** Ancho normalizado 0–1. */
  width: number;
}

export interface KeyboardLayout {
  range: KeyboardRange;
  whiteCount: number;
  /** Teclas blancas primero y negras después, para dibujarlas en ese orden. */
  keys: KeyRect[];
  key(pitch: number): KeyRect | undefined;
}

export const isBlack = (pitch: number) => BLACK.has(((pitch % 12) + 12) % 12);

/** Un teclado siempre empieza y termina en tecla blanca. */
export function normalizeRange(range: KeyboardRange): KeyboardRange {
  let { low, high } = range;
  if (isBlack(low)) low--;
  if (isBlack(high)) high++;
  return { low, high };
}

export function layoutKeyboard(input: KeyboardRange): KeyboardLayout {
  const range = normalizeRange(input);
  let whiteCount = 0;
  for (let p = range.low; p <= range.high; p++) if (!isBlack(p)) whiteCount++;
  const w = 1 / whiteCount;

  const whites: KeyRect[] = [];
  const blacks: KeyRect[] = [];
  let whiteIndex = 0;
  for (let p = range.low; p <= range.high; p++) {
    if (!isBlack(p)) {
      whites.push({ pitch: p, black: false, x: whiteIndex * w, width: w });
      whiteIndex++;
    } else {
      // La negra se apoya en la unión entre la blanca anterior y la siguiente.
      const joint = whiteIndex * w;
      const center = joint + (BLACK_OFFSET[p % 12] ?? 0) * w;
      blacks.push({
        pitch: p,
        black: true,
        x: center - (BLACK_WIDTH * w) / 2,
        width: BLACK_WIDTH * w,
      });
    }
  }

  const keys = [...whites, ...blacks];
  const byPitch = new Map(keys.map((k) => [k.pitch, k]));
  return { range, whiteCount, keys, key: (pitch) => byPitch.get(pitch) };
}
