import { createNoteEvent } from '@impromptu/core';
import { describe, expect, it } from 'vitest';
import { baquetas } from './baquetas';

const golpe = (pitch: number, start: number) =>
  createNoteEvent({ pitch, start, end: start + 0.1, velocity: 100, origin: 'midi-file' });

describe('baquetas de la batería (pedido 40)', () => {
  it('ritmo de rock: hi-hat con la derecha, caja con la izquierda, bombo con el pie', () => {
    const hihat = golpe(42, 0.5);
    const caja = golpe(38, 0.5);
    const bombo = golpe(36, 0);
    const b = baquetas([golpe(42, 0), bombo, hihat, caja]);
    expect(b.get(hihat.id)).toBe('R');
    expect(b.get(caja.id)).toBe('L');
    expect(b.get(bombo.id)).toBe('RF');
  });

  it('un redoble rápido en la caja alterna R-L-R-L', () => {
    const redoble = [0, 0.12, 0.24, 0.36].map((t) => golpe(38, t));
    const b = baquetas(redoble);
    expect(redoble.map((n) => b.get(n.id))).toEqual(['R', 'L', 'R', 'L']);
  });

  it('golpes de caja separados empiezan siempre con la derecha', () => {
    const lentos = [0, 1, 2].map((t) => golpe(38, t));
    const b = baquetas(lentos);
    expect(lentos.map((n) => b.get(n.id))).toEqual(['R', 'R', 'R']);
  });
});
