import { describe, expect, it } from 'vitest';
import { aRedondas, posicionEn } from './cursor';
import type { PuntoCursor } from './cursor';

const puntos: PuntoCursor[] = [
  { t: 0, x: 100, y: 10, alto: 50, renglon: 0 },
  { t: 0.25, x: 200, y: 10, alto: 50, renglon: 0 },
  { t: 0.5, x: 120, y: 90, alto: 50, renglon: 1 },
];
const fines = new Map([
  [0, 400],
  [1, 400],
]);

describe('cursor suave de la partitura', () => {
  it('se desliza entre una nota y la siguiente', () => {
    expect(posicionEn(puntos, fines, 0.125)!.x).toBeCloseTo(150);
  });

  it('antes de bajar de renglón avanza hasta el final del renglón', () => {
    const p = posicionEn(puntos, fines, 0.375)!;
    expect(p.x).toBeCloseTo(300);
    expect(p.renglon).toBe(0);
    expect(posicionEn(puntos, fines, 0.5)!.renglon).toBe(1);
  });

  it('pasa de segundos a redondas dentro de cada compás', () => {
    // 4/4 a 120: cada compás dura 2 s.
    expect(aRedondas(1, [0, 2, 4], 120, [4, 4])).toBeCloseTo(0.5);
    expect(aRedondas(3, [0, 2, 4], 120, [4, 4])).toBeCloseTo(1.5);
  });
});
