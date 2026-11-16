import { KEYBOARD_PRESETS } from '@impromptu/core';
import { describe, expect, it } from 'vitest';
import { BLACK_WIDTH, isBlack, layoutKeyboard, normalizeRange } from './keyboard-layout';

describe('geometría del teclado', () => {
  it('cuenta teclas blancas de 61, 76 y 88', () => {
    expect(layoutKeyboard(KEYBOARD_PRESETS[61]).whiteCount).toBe(36);
    expect(layoutKeyboard(KEYBOARD_PRESETS[76]).whiteCount).toBe(45);
    expect(layoutKeyboard(KEYBOARD_PRESETS[88]).whiteCount).toBe(52);
    expect(layoutKeyboard(KEYBOARD_PRESETS[88]).keys).toHaveLength(88);
  });

  it('las blancas cubren todo el ancho sin huecos', () => {
    const whites = layoutKeyboard(KEYBOARD_PRESETS[61]).keys.filter((k) => !k.black);
    expect(whites[0]!.x).toBe(0);
    const last = whites[whites.length - 1]!;
    expect(last.x + last.width).toBeCloseTo(1, 10);
    whites.slice(1).forEach((k, i) => expect(k.x).toBeCloseTo(whites[i]!.x + whites[i]!.width, 10));
  });

  it('las negras no son equidistantes: siguen la clase de nota (B-014)', () => {
    const kb = layoutKeyboard(KEYBOARD_PRESETS[61]);
    const w = 1 / kb.whiteCount;
    const center = (p: number) => kb.key(p)!.x + kb.key(p)!.width / 2;
    // Unión C|D = borde derecho de C; C# va a su izquierda y D# a la derecha de D|E.
    const c = kb.key(60)!;
    expect(center(61)).toBeLessThan(c.x + w);
    expect(center(63)).toBeGreaterThan(kb.key(62)!.x + w);
    expect(center(68)).toBeCloseTo(kb.key(67)!.x + w, 10); // G# centrada
    expect(kb.key(61)!.width).toBeCloseTo(BLACK_WIDTH * w, 10);
  });

  it('cada negra queda entre sus dos blancas y sin pisar a otra negra', () => {
    const kb = layoutKeyboard(KEYBOARD_PRESETS[88]);
    const blacks = kb.keys.filter((k) => k.black).sort((a, b) => a.x - b.x);
    for (const b of blacks) {
      const left = kb.key(b.pitch - 1)!;
      const right = kb.key(b.pitch + 1)!;
      expect(b.x).toBeGreaterThan(left.x);
      expect(b.x + b.width).toBeLessThan(right.x + right.width);
    }
    blacks.slice(1).forEach((b, i) => expect(b.x).toBeGreaterThan(blacks[i]!.x + blacks[i]!.width));
  });

  it('dibuja blancas antes que negras', () => {
    const keys = layoutKeyboard(KEYBOARD_PRESETS[61]).keys;
    const firstBlack = keys.findIndex((k) => k.black);
    expect(keys.slice(firstBlack).every((k) => k.black)).toBe(true);
  });

  it('un rango que empieza o termina en negra se amplía a blanca', () => {
    expect(isBlack(61)).toBe(true);
    expect(isBlack(-11)).toBe(true);
    expect(normalizeRange({ low: 61, high: 70 })).toEqual({ low: 60, high: 71 });
    expect(layoutKeyboard({ low: 61, high: 70 }).key(60)).toBeDefined();
  });
});
