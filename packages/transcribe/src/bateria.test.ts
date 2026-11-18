import { golpe } from '@impromptu/audio';
import { describe, expect, it } from 'vitest';
import { detectarBateria } from './bateria';

const TASA = 44_100;

/** Un ritmo armado con los golpes del sintetizador. */
function ritmo(golpes: [number, number][], segundos = 4): Float32Array {
  const x = new Float32Array(segundos * TASA);
  for (const [nota, t] of golpes) {
    const g = golpe(nota, 110, TASA);
    const i0 = Math.round(t * TASA);
    for (let i = 0; i < g.length && i0 + i < x.length; i++) x[i0 + i] = x[i0 + i]! + g[i]!;
  }
  return x;
}

describe('detector de batería', () => {
  it('encuentra bombo, caja y hi-hat en su lugar', () => {
    const x = ritmo([
      [36, 0.5],
      [42, 1.0],
      [38, 1.5],
      [42, 2.0],
      [36, 2.5],
      [38, 3.0],
    ]);
    const g = detectarBateria(x, TASA);
    const hay = (nota: number, t: number) =>
      g.some((o) => o.nota === nota && Math.abs(o.tiempo - t) < 0.05);
    expect(hay(36, 0.5)).toBe(true);
    expect(hay(36, 2.5)).toBe(true);
    expect(hay(38, 1.5)).toBe(true);
    expect(hay(38, 3.0)).toBe(true);
    expect(hay(42, 1.0)).toBe(true);
    expect(hay(42, 2.0)).toBe(true);
    // Sin golpes inventados lejos de los reales.
    const reales = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0];
    expect(g.every((o) => reales.some((t) => Math.abs(o.tiempo - t) < 0.08))).toBe(true);
  });

  it('el silencio no tiene golpes', () => {
    expect(detectarBateria(new Float32Array(TASA * 2), TASA)).toEqual([]);
  });
});
