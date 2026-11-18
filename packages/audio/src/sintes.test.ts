import { describe, expect, it } from 'vitest';
import { cuerda, golpe } from './sintes';

/** Frecuencia por autocorrelación (lo suficiente para saber si la cuerda está afinada). */
function frecuencia(x: Float32Array, tasa: number): number {
  const desde = Math.floor(tasa * 0.05);
  const n = Math.floor(tasa * 0.1);
  let mejor = 0;
  let periodo = 0;
  for (let p = Math.floor(tasa / 1500); p < tasa / 40; p++) {
    let s = 0;
    for (let i = desde; i < desde + n; i++) s += x[i]! * x[i + p]!;
    if (s > mejor) {
      mejor = s;
      periodo = p;
    }
  }
  return tasa / periodo;
}

describe('sintetizadores', () => {
  it('la cuerda suena afinada (la 110 Hz y el mi 329,6 Hz)', () => {
    expect(frecuencia(cuerda(45, 100, 'acero', 48_000), 48_000)).toBeCloseTo(110, -0.5);
    expect(frecuencia(cuerda(64, 100, 'nylon', 48_000), 48_000)).toBeGreaterThan(320);
    expect(frecuencia(cuerda(64, 100, 'nylon', 48_000), 48_000)).toBeLessThan(340);
  });

  it('la cuerda se apaga y no satura', () => {
    const x = cuerda(52, 127, 'electrica', 48_000);
    const pico = x.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
    expect(pico).toBeGreaterThan(0.05);
    expect(pico).toBeLessThanOrEqual(1);
    expect(Math.abs(x[x.length - 1]!)).toBeLessThan(0.001);
  });

  it('cada pieza de la batería suena distinto y más fuerte con más fuerza', () => {
    const energia = (x: Float32Array) => x.reduce((s, v) => s + v * v, 0);
    for (const n of [36, 38, 42, 46, 49, 51, 43])
      expect(energia(golpe(n, 100, 48_000))).toBeGreaterThan(0);
    expect(energia(golpe(38, 127, 48_000))).toBeGreaterThan(energia(golpe(38, 30, 48_000)));
    expect(golpe(46, 100, 48_000).length).toBeGreaterThan(golpe(42, 100, 48_000).length);
  });
});
