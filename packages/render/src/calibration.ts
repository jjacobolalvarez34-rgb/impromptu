import type { KeyboardCalibration } from '@impromptu/core';
import { layoutKeyboard } from './keyboard-layout';
import type { KeyboardLayout, KeyRect } from './keyboard-layout';

/** Rectángulo donde se dibuja el video dentro del cuadro (px). */
export interface VideoRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** El video cubre todo el cuadro, recortando lo que sobre (como `object-fit: cover`). */
export function coverRect(
  frameW: number,
  frameH: number,
  videoW: number,
  videoH: number,
): VideoRect {
  const s = Math.max(frameW / videoW, frameH / videoH);
  const width = videoW * s;
  const height = videoH * s;
  return { x: (frameW - width) / 2, y: (frameH - height) / 2, width, height };
}

/**
 * Teclado que coincide con las teclas reales del video (plantilla "Cámara arriba").
 * Toma la geometría del teclado virtual entre las dos teclas marcadas y la estira para
 * que sus centros caigan donde el usuario las marcó. No corrige perspectiva: la cámara
 * debe estar arriba y de frente al teclado (ARQUITECTURA, calibración).
 *
 * Devuelve posiciones normalizadas al ancho del cuadro, como espera `noteRect`.
 */
export function calibratedKeyboard(
  cal: KeyboardCalibration,
  rect: VideoRect,
  frameWidth: number,
): KeyboardLayout {
  const low = Math.min(cal.lowKey.pitch, cal.highKey.pitch);
  const high = Math.max(cal.lowKey.pitch, cal.highKey.pitch);
  const [left, right] =
    cal.lowKey.pitch <= cal.highKey.pitch ? [cal.lowKey, cal.highKey] : [cal.highKey, cal.lowKey];
  const base = layoutKeyboard({ low, high });
  const center = (k: KeyRect) => k.x + k.width / 2;
  const cLow = center(base.key(low) ?? base.keys[0]!);
  const cHigh = center(base.key(high) ?? base.keys[base.keys.length - 1]!);
  // Posición en px del cuadro de un punto del teclado virtual (0–1).
  const toFrame = (k: number) => {
    const t = cHigh === cLow ? 0 : (k - cLow) / (cHigh - cLow);
    const xVideo = left.x + t * (right.x - left.x); // 0–1 del video
    return rect.x + xVideo * rect.width;
  };
  const scale = (toFrame(1) - toFrame(0)) / frameWidth;
  const keys = base.keys.map((k) => ({
    ...k,
    x: toFrame(k.x) / frameWidth,
    width: k.width * scale,
  }));
  const byPitch = new Map(keys.map((k) => [k.pitch, k]));
  return { range: base.range, whiteCount: base.whiteCount, keys, key: (p) => byPitch.get(p) };
}

/** Línea de aterrizaje de la calibración, en px del cuadro. */
export function calibratedKeyLine(cal: KeyboardCalibration, rect: VideoRect): number {
  return rect.y + cal.keyLineY * rect.height;
}
