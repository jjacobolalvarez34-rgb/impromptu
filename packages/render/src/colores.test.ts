import { describe, expect, it } from 'vitest';
import { createNoteEvent } from '@impromptu/core';
import { ARCOIRIS_12, colorSegunModo, mezclar } from './colores';
import type { AjustesColor } from './colores';

const colores = { right: '#FF9F1C', left: '#E8E4DC', unassigned: '#9A968C' };
const base: AjustesColor = { modo: 'mano', division: 60, colores, rango: { low: 36, high: 96 } };
const nota = (pitch: number, extra: Partial<Parameters<typeof createNoteEvent>[0]> = {}) =>
  createNoteEvent({ pitch, start: 0, end: 1, velocity: 90, origin: 'edit', ...extra });

describe('colores de las notas (pedido 65)', () => {
  it('por mano usa el color de cada mano', () => {
    expect(colorSegunModo(nota(60, { hand: 'R' }), base)).toBe(colores.right);
    expect(colorSegunModo(nota(40, { hand: 'L' }), base)).toBe(colores.left);
    expect(colorSegunModo(nota(40), base)).toBe(colores.unassigned);
  });

  it('dividido por una tecla: de ella para arriba, derecha', () => {
    const a = { ...base, modo: 'division' as const, division: 44 };
    expect(colorSegunModo(nota(44), a)).toBe(colores.right);
    expect(colorSegunModo(nota(43), a)).toBe(colores.left);
  });

  it('12 notas: el mismo color para la misma nota en cualquier octava', () => {
    const a = { ...base, modo: 'nota12' as const };
    expect(colorSegunModo(nota(60), a)).toBe(ARCOIRIS_12[0]);
    expect(colorSegunModo(nota(72), a)).toBe(ARCOIRIS_12[0]);
    expect(colorSegunModo(nota(61), a)).toBe(ARCOIRIS_12[1]);
  });

  it('degradado: graves con el izquierdo y agudos con el derecho', () => {
    const a = { ...base, modo: 'degradado' as const };
    expect(colorSegunModo(nota(36), a)).toBe(colores.left.toUpperCase());
    expect(colorSegunModo(nota(96), a)).toBe(colores.right.toUpperCase());
    expect(colorSegunModo(nota(66), a)).toBe(mezclar(colores.left, colores.right, 0.5));
  });

  it('por pista y por canal: los dos primeros son los de las manos', () => {
    expect(colorSegunModo(nota(60), { ...base, modo: 'pista' }, 0)).toBe(colores.right);
    expect(colorSegunModo(nota(60), { ...base, modo: 'pista' }, 1)).toBe(colores.left);
    expect(colorSegunModo(nota(60, { channel: 1 }), { ...base, modo: 'canal' })).toBe(colores.left);
    expect(colorSegunModo(nota(60, { channel: 5 }), { ...base, modo: 'canal' })).not.toBe(
      colores.right,
    );
  });

  it('al azar es estable: la misma nota siempre del mismo color', () => {
    const a = { ...base, modo: 'azar' as const };
    const n = nota(60);
    expect(colorSegunModo(n, a)).toBe(colorSegunModo(n, a));
  });
});
