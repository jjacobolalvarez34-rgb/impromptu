import { describe, expect, it } from 'vitest';
import { normalizar } from './volumen';

const tono = (amplitud: number, n = 22_050) =>
  Float32Array.from({ length: n }, (_, i) => amplitud * Math.sin((2 * Math.PI * 196 * i) / 22_050));

describe('subir el volumen antes de la IA (pedido 55)', () => {
  it('sube una grabación bajita hasta cerca del máximo', () => {
    const x = tono(0.05);
    expect(normalizar(x)).toBeCloseTo(18, 0);
    const max = x.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
    expect(max).toBeGreaterThan(0.85);
    expect(max).toBeLessThan(0.95);
  });
  it('no toca lo que ya suena fuerte ni el silencio', () => {
    expect(normalizar(tono(0.95))).toBe(1);
    expect(normalizar(new Float32Array(1000))).toBe(1);
  });
  it('no sube más de 30 veces', () => {
    expect(normalizar(tono(0.001))).toBe(30);
  });
  it('un clic suelto no impide subirlo', () => {
    const x = tono(0.05, 44_100);
    x[100] = 1;
    expect(normalizar(x)).toBeGreaterThan(10);
  });
});
