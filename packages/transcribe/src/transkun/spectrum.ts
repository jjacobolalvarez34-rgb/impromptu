/**
 * Características de entrada de Transkun V2 (Yan y Duan; código MIT): igual que `makeFrame`,
 * la normalización de `processFramesBatch` y `MelSpectrum` del original, pero en TypeScript
 * (la FFT de PyTorch no se puede exportar a ONNX).
 *
 * Salida: [T, nMels, nWins] (cuadro, banda mel, ventana), lista para la red ONNX.
 */

export interface SpectrumConsts {
  fs: number;
  hopSize: number;
  windowSize: number;
  nMels: number;
  eps: number;
  /** [nWins, windowSize]: Hann y las ventanas gaussianas aprendidas. */
  windows: Float32Array;
  /** [windowSize/2+1, nMels] */
  freq2mels: Float32Array;
}

/** Número de cuadros de `length` muestras (igual que makeFrame con medio cuadro a la izquierda). */
export const frameCount = (length: number, hop: number) => Math.ceil(length / hop) + 1;

/** FFT compleja radix-2 en el lugar (re, im de largo potencia de 2). */
function fft(re: Float64Array, im: Float64Array, cos: Float64Array, sin: Float64Array): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j]!, re[i]!];
      [im[i], im[j]] = [im[j]!, im[i]!];
    }
  }
  for (let size = 2; size <= n; size <<= 1) {
    const half = size >> 1;
    const step = n / size;
    for (let start = 0; start < n; start += size) {
      for (let k = 0; k < half; k++) {
        const c = cos[k * step]!;
        const s = sin[k * step]!;
        const a = start + k;
        const b = a + half;
        const tr = re[b]! * c + im[b]! * s;
        const ti = im[b]! * c - re[b]! * s;
        re[b] = re[a]! - tr;
        im[b] = im[a]! - ti;
        re[a] = re[a]! + tr;
        im[a] = im[a]! + ti;
      }
    }
  }
}

/**
 * Características de un segmento. `channels`: audio del segmento por canal (mismo largo), a
 * `consts.fs`. Varios canales se promedian en potencia, como `toMono` del original.
 */
export function segmentFeatures(
  channels: readonly Float32Array[],
  consts: SpectrumConsts,
): Float32Array {
  const { hopSize: hop, windowSize: win, nMels, eps } = consts;
  const nWins = consts.windows.length / win;
  const nBins = win / 2 + 1;
  const length = channels[0]!.length;
  const T = frameCount(length, hop);
  const lPad = win / 2;

  // Muestra del cuadro t, posición k (con el relleno de ceros de makeFrame).
  const sampleAt = (ch: Float32Array, t: number, k: number) => {
    const i = t * hop + k - lPad;
    return i >= 0 && i < length ? ch[i]! : 0;
  };

  // Normalización de ganancia sobre todos los cuadros (con sus solapes), std insesgada.
  let sum = 0;
  let sumSq = 0;
  for (const ch of channels) {
    for (let t = 0; t < T; t++) {
      for (let k = 0; k < win; k++) {
        const v = sampleAt(ch, t, k);
        sum += v;
        sumSq += v * v;
      }
    }
  }
  const n = channels.length * T * win;
  const mean = sum / n;
  const std = Math.sqrt(Math.max(0, (sumSq - n * mean * mean) / (n - 1)));
  const scale = 1 / (std + 1e-8);

  const cos = new Float64Array(win / 2);
  const sin = new Float64Array(win / 2);
  for (let k = 0; k < win / 2; k++) {
    cos[k] = Math.cos((2 * Math.PI * k) / win);
    sin[k] = Math.sin((2 * Math.PI * k) / win);
  }
  const re = new Float64Array(win);
  const im = new Float64Array(win);
  const power = new Float64Array(nBins);
  const frame = new Float64Array(win);
  const out = new Float32Array(T * nMels * nWins);
  const logEps = Math.log(eps);
  // Los filtros mel son triangulares: cada banda solo suma unos pocos bins.
  const ranges = melRanges(consts.freq2mels, nBins, nMels);

  for (let t = 0; t < T; t++) {
    for (let w = 0; w < nWins; w++) {
      power.fill(0);
      for (const ch of channels) {
        for (let k = 0; k < win; k++) frame[k] = (sampleAt(ch, t, k) - mean) * scale;
        for (let k = 0; k < win; k++) {
          re[k] = frame[k]! * consts.windows[w * win + k]!;
          im[k] = 0;
        }
        fft(re, im, cos, sin);
        // rfft con norm="ortho": se divide por sqrt(win); la potencia, por win.
        for (let b = 0; b < nBins; b++)
          power[b] = power[b]! + (re[b]! * re[b]! + im[b]! * im[b]!) / win;
      }
      if (channels.length > 1)
        for (let b = 0; b < nBins; b++) power[b] = power[b]! / channels.length;
      for (let m = 0; m < nMels; m++) {
        let mel = 0;
        const [lo, hi] = ranges[m]!;
        for (let b = lo; b <= hi; b++) mel += power[b]! * consts.freq2mels[b * nMels + m]!;
        out[(t * nMels + m) * nWins + w] = (Math.log(mel + eps) - logEps) / -logEps;
      }
    }
  }
  return out;
}

/** Para cada banda mel, el primer y último bin con peso distinto de cero. */
function melRanges(freq2mels: Float32Array, nBins: number, nMels: number): [number, number][] {
  return Array.from({ length: nMels }, (_, m) => {
    let lo = nBins;
    let hi = -1;
    for (let b = 0; b < nBins; b++) {
      if (freq2mels[b * nMels + m] !== 0) {
        lo = Math.min(lo, b);
        hi = b;
      }
    }
    return [lo, hi] as [number, number];
  });
}
