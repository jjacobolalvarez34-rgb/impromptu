import { describe, expect, it } from 'vitest';
import { KEYBOARD_PRESETS, countOutOfRange, fitKeyboardRange, keyCount } from './keyboard';

describe('rango de teclado', () => {
  it('los presets tienen 61, 76 y 88 teclas', () => {
    expect(keyCount(KEYBOARD_PRESETS[61])).toBe(61);
    expect(keyCount(KEYBOARD_PRESETS[76])).toBe(76);
    expect(keyCount(KEYBOARD_PRESETS[88])).toBe(88);
  });

  it('elige el teclado más pequeño que cubre las notas (B-015)', () => {
    expect(fitKeyboardRange([60, 72])).toEqual({ low: 36, high: 96 });
    expect(fitKeyboardRange([36, 96])).toEqual({ low: 36, high: 96 });
    // Nostalgia de Jacobo baja hasta la 35: ya no cabe en 61 teclas.
    expect(fitKeyboardRange([35, 96])).toEqual({ low: 28, high: 103 });
    expect(fitKeyboardRange([21, 108])).toEqual({ low: 21, high: 108 });
  });

  it('no pierde notas fuera de un piano de 88', () => {
    expect(fitKeyboardRange([12, 60])).toEqual({ low: 12, high: 108 });
  });

  it('sin notas usa 61 teclas y devuelve una copia', () => {
    const r = fitKeyboardRange([]);
    expect(r).toEqual(KEYBOARD_PRESETS[61]);
    expect(r).not.toBe(KEYBOARD_PRESETS[61]);
  });

  it('cuenta notas fuera de rango', () => {
    expect(countOutOfRange([35, 36, 96, 97], KEYBOARD_PRESETS[61])).toBe(2);
  });
});
