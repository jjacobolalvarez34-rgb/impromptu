import { describe, expect, it } from 'vitest';
import {
  BINS,
  F,
  Fft,
  N_FFT,
  T,
  cuadrosDe,
  espectroCuadro,
  mascara,
  normalizar,
  sumarCuadro,
} from './spleeter';

describe('separar instrumentos: STFT y máscaras', () => {
  it('la FFT de ida y vuelta devuelve la señal', () => {
    const fft = new Fft(16);
    const re = Float64Array.from({ length: 16 }, (_, i) => Math.sin(i) + i * 0.1);
    const im = new Float64Array(16);
    const original = re.slice();
    fft.transformar(re, im);
    fft.transformar(re, im, true);
    for (let i = 0; i < 16; i++) expect(re[i]! / 16).toBeCloseTo(original[i]!, 10);
  });

  it('desarmar y volver a armar (máscara 1) da la misma señal', () => {
    const largo = 20_000;
    const x = Float32Array.from(
      { length: largo },
      (_, i) => Math.sin(i * 0.05) * 0.5 + Math.sin(i * 0.31) * 0.2,
    );
    const fft = new Fft(N_FFT);
    const re = new Float64Array(N_FFT);
    const im = new Float64Array(N_FFT);
    const salida = new Float32Array(largo);
    const pesos = new Float32Array(largo);
    for (let f = 0; f < cuadrosDe(largo); f++) {
      espectroCuadro(x, f, fft, re, im);
      sumarCuadro(re, im, f, fft, salida, pesos);
    }
    normalizar(salida, pesos);
    let error = 0;
    for (let i = 0; i < largo; i++) error = Math.max(error, Math.abs(salida[i]! - x[i]!));
    expect(error).toBeLessThan(1e-4);
  });

  it('las máscaras de las cuatro partes suman 1', () => {
    const estimaciones = [0, 1, 2, 3].map((p) =>
      Float32Array.from({ length: 2 * T * F }, (_, i) => ((i * (p + 3)) % 7) / 7),
    );
    const mascaras = [0, 1, 2, 3].map((p) => mascara(estimaciones, p));
    for (const i of [0, 5, 1023, 1024, 2048, 2 * T * BINS - 1]) {
      const suma = mascaras.reduce((s, m) => s + m[i]!, 0);
      expect(suma).toBeCloseTo(1, 5);
    }
  });
});
