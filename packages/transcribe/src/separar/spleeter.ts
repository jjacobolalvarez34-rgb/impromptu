/**
 * Separar instrumentos (pedido 35 de Jacobo, como Moises): Spleeter de Deezer (pesos MIT, ver
 * docs/LICENCIAS.md) en ONNX. Aquí va lo que no es la red: STFT, máscaras e iSTFT, igual que el
 * ejemplo de referencia del modelo (Hann periódica de 4096, salto de 1024, 1024 bins a la red,
 * máscara suave con las cuatro partes y la banda alta con el promedio de cada cuadro).
 * Se trabaja de a 512 cuadros (~12 s) para no llenar la memoria con una canción entera.
 */

export const N_FFT = 4096;
export const HOP = 1024;
export const PAD = N_FFT - HOP;
/** Cuadros por bloque de la red y bins que ve la red. */
export const T = 512;
export const F = 1024;
export const BINS = N_FFT / 2 + 1;
export const PARTES = ['vocals', 'drums', 'bass', 'other'] as const;
export type Parte = (typeof PARTES)[number];

/** Ventana de Hann periódica (no la simétrica). */
export const VENTANA = (() => {
  const w = new Float32Array(N_FFT);
  for (let i = 0; i < N_FFT; i++) w[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N_FFT);
  return w;
})();

/** FFT compleja en el lugar, radix 2 (N potencia de 2). `inversa` sin dividir por N. */
export class Fft {
  private readonly rev: Uint32Array;
  private readonly cos: Float64Array;
  private readonly sin: Float64Array;
  constructor(readonly n: number) {
    this.rev = new Uint32Array(n);
    const bits = Math.log2(n);
    for (let i = 0; i < n; i++) {
      let r = 0;
      for (let b = 0; b < bits; b++) r |= ((i >> b) & 1) << (bits - 1 - b);
      this.rev[i] = r;
    }
    this.cos = new Float64Array(n / 2);
    this.sin = new Float64Array(n / 2);
    for (let i = 0; i < n / 2; i++) {
      this.cos[i] = Math.cos((2 * Math.PI * i) / n);
      this.sin[i] = Math.sin((2 * Math.PI * i) / n);
    }
  }

  transformar(re: Float64Array, im: Float64Array, inversa = false): void {
    const n = this.n;
    for (let i = 0; i < n; i++) {
      const j = this.rev[i]!;
      if (j > i) {
        let t = re[i]!;
        re[i] = re[j]!;
        re[j] = t;
        t = im[i]!;
        im[i] = im[j]!;
        im[j] = t;
      }
    }
    const signo = inversa ? 1 : -1;
    for (let largo = 2; largo <= n; largo <<= 1) {
      const mitad = largo >> 1;
      const paso = n / largo;
      for (let i = 0; i < n; i += largo) {
        for (let k = 0; k < mitad; k++) {
          const wr = this.cos[k * paso]!;
          const wi = signo * this.sin[k * paso]!;
          const a = i + k;
          const b = a + mitad;
          const xr = re[b]! * wr - im[b]! * wi;
          const xi = re[b]! * wi + im[b]! * wr;
          re[b] = re[a]! - xr;
          im[b] = im[a]! - xi;
          re[a] = re[a]! + xr;
          im[a] = im[a]! + xi;
        }
      }
    }
  }
}

/** Cuántos cuadros tiene la señal (con el relleno del principio). */
export const cuadrosDe = (largo: number) => Math.ceil((PAD + largo) / HOP);

/**
 * Espectro (BINS complejos) del cuadro `f` de la señal `x`, con el relleno del principio. Deja el
 * resultado en `re`/`im` (largo N_FFT; se usan los primeros BINS).
 */
export function espectroCuadro(
  x: Float32Array,
  f: number,
  fft: Fft,
  re: Float64Array,
  im: Float64Array,
): void {
  const desde = f * HOP - PAD;
  for (let k = 0; k < N_FFT; k++) {
    const i = desde + k;
    re[k] = i >= 0 && i < x.length ? x[i]! * VENTANA[k]! : 0;
    im[k] = 0;
  }
  fft.transformar(re, im);
}

/**
 * Máscaras suaves de una parte para un bloque: `estimaciones` son las salidas de las cuatro
 * redes ([2][T][F] aplanado); devuelve [2][T][BINS] con la banda alta = promedio del cuadro.
 */
export function mascara(estimaciones: readonly Float32Array[], parte: number): Float32Array {
  const salida = new Float32Array(2 * T * BINS);
  const n = estimaciones.length;
  for (let c = 0; c < 2; c++) {
    for (let t = 0; t < T; t++) {
      let suma = 0;
      const base = (c * T + t) * F;
      const fila = (c * T + t) * BINS;
      for (let f = 0; f < F; f++) {
        let total = 1e-10;
        for (const e of estimaciones) total += e[base + f]! ** 2;
        const m = (estimaciones[parte]![base + f]! ** 2 + 1e-10 / n) / total;
        salida[fila + f] = m;
        suma += m;
      }
      const promedio = suma / F;
      for (let f = F; f < BINS; f++) salida[fila + f] = promedio;
    }
  }
  return salida;
}

/**
 * Suma un cuadro reconstruido (espectro enmascarado → iFFT → ventana) en la salida, con el peso
 * de la ventana al cuadrado para normalizar al final.
 */
export function sumarCuadro(
  re: Float64Array,
  im: Float64Array,
  f: number,
  fft: Fft,
  salida: Float32Array,
  pesos: Float32Array,
): void {
  // Espectro hermítico completo a partir de los BINS.
  for (let k = 1; k < N_FFT / 2; k++) {
    re[N_FFT - k] = re[k]!;
    im[N_FFT - k] = -im[k]!;
  }
  fft.transformar(re, im, true);
  const desde = f * HOP - PAD;
  for (let k = 0; k < N_FFT; k++) {
    const i = desde + k;
    if (i < 0 || i >= salida.length) continue;
    const w = VENTANA[k]!;
    salida[i] = salida[i]! + (re[k]! / N_FFT) * w;
    pesos[i] = pesos[i]! + w * w;
  }
}

/** Divide por el peso de las ventanas (solo donde hubo alguna). */
export function normalizar(salida: Float32Array, pesos: Float32Array): void {
  for (let i = 0; i < salida.length; i++) salida[i] = pesos[i]! > 1e-8 ? salida[i]! / pesos[i]! : 0;
}
