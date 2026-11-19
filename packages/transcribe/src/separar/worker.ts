/// <reference lib="webworker" />
import * as ort from 'onnxruntime-web/wasm';
import wasmUrl from 'onnxruntime-web/ort-wasm-simd-threaded.wasm?url';
import {
  BINS,
  F,
  Fft,
  N_FFT,
  PARTES,
  T,
  cuadrosDe,
  espectroCuadro,
  mascara,
  normalizar,
  sumarCuadro,
} from './spleeter';
import type { Parte } from './spleeter';

/**
 * Worker que separa instrumentos con Spleeter (pedido 35). Las cuatro redes (voz, batería, bajo
 * y "otros") hacen falta siempre: la máscara de una parte se calcula con todas. Los archivos se
 * bajan una vez y quedan en caché, como el modelo de piano.
 */
export type SepararRequest = {
  type: 'run';
  izq: Float32Array;
  der: Float32Array;
  parte: Parte;
  baseUrl: string;
};

export type SepararMessage =
  | { type: 'download'; loaded: number; total: number }
  | { type: 'ready' }
  | { type: 'progress'; value: number }
  | { type: 'done'; izq: Float32Array; der: Float32Array }
  | { type: 'error'; message: string };

const post = (m: SepararMessage, transferir: Transferable[] = []) =>
  (self as unknown as Worker).postMessage(m, transferir);
const CACHE = 'impromptu-modelos-v1';
/** Tamaño aproximado de las cuatro redes (bytes), para el avance de la descarga. */
const APROX = 79e6;

async function bajar(baseUrl: string): Promise<ArrayBuffer[]> {
  const cache = 'caches' in self ? await caches.open(CACHE) : null;
  const cargado: number[] = [0, 0, 0, 0];
  const totales: number[] = [0, 0, 0, 0];
  const avisar = () =>
    post({
      type: 'download',
      loaded: cargado.reduce((a, b) => a + b, 0),
      total: Math.max(
        APROX,
        totales.reduce((a, b) => a + b, 0),
      ),
    });
  return Promise.all(
    PARTES.map(async (p, i) => {
      const url = `${baseUrl}spleeter-${p}.fp16.onnx`;
      const guardado = await cache?.match(url);
      if (guardado) return guardado.arrayBuffer();
      const res = await fetch(url);
      if (!res.ok || !res.body)
        throw new Error(`No se pudo descargar el separador (${res.status})`);
      totales[i] = Number(res.headers.get('content-length') ?? 0);
      const lector = res.body.getReader();
      const trozos: Uint8Array[] = [];
      let largo = 0;
      for (;;) {
        const { done, value } = await lector.read();
        if (done) break;
        trozos.push(value);
        largo += value.length;
        cargado[i] = largo;
        avisar();
      }
      const bytes = new Uint8Array(largo);
      let en = 0;
      for (const t of trozos) {
        bytes.set(t, en);
        en += t.length;
      }
      await cache?.put(url, new Response(bytes));
      return bytes.buffer;
    }),
  );
}

async function separar({ izq, der, parte, baseUrl }: SepararRequest): Promise<void> {
  ort.env.wasm.wasmPaths = { wasm: wasmUrl };
  ort.env.wasm.numThreads = self.crossOriginIsolated
    ? Math.max(1, Math.min(8, navigator.hardwareConcurrency || 4))
    : 1;
  const archivos = await bajar(baseUrl);
  const opciones: ort.InferenceSession.SessionOptions = {
    executionProviders: ['wasm'],
    graphOptimizationLevel: 'extended',
  };
  const redes = await Promise.all(
    archivos.map((a) => ort.InferenceSession.create(new Uint8Array(a), opciones)),
  );
  post({ type: 'ready' });

  const canales = [izq, der];
  const n = izq.length;
  const total = cuadrosDe(n);
  const bloques = Math.ceil(total / T);
  const indice = PARTES.indexOf(parte);
  const fft = new Fft(N_FFT);
  const re = new Float64Array(N_FFT);
  const im = new Float64Array(N_FFT);
  const salida = [new Float32Array(n), new Float32Array(n)];
  const pesos = [new Float32Array(n), new Float32Array(n)];
  const especRe = new Float32Array(2 * T * BINS);
  const especIm = new Float32Array(2 * T * BINS);
  for (let b = 0; b < bloques; b++) {
    const f0 = b * T;
    const nf = Math.min(T, total - f0);
    const entrada = new Float32Array(2 * T * F);
    especRe.fill(0);
    especIm.fill(0);
    for (let c = 0; c < 2; c++) {
      for (let t = 0; t < nf; t++) {
        espectroCuadro(canales[c]!, f0 + t, fft, re, im);
        const fila = (c * T + t) * BINS;
        for (let k = 0; k < BINS; k++) {
          especRe[fila + k] = re[k]!;
          especIm[fila + k] = im[k]!;
        }
        const base = (c * T + t) * F;
        for (let k = 0; k < F; k++) entrada[base + k] = Math.hypot(re[k]!, im[k]!);
      }
    }
    const tensor = new ort.Tensor('float32', entrada, [2, 1, T, F]);
    const estimaciones: Float32Array[] = [];
    for (const red of redes) {
      const r = await red.run({ x: tensor });
      estimaciones.push(new Float32Array(r.y!.data as Float32Array));
    }
    const m = mascara(estimaciones, indice);
    for (let c = 0; c < 2; c++) {
      for (let t = 0; t < nf; t++) {
        const fila = (c * T + t) * BINS;
        for (let k = 0; k < BINS; k++) {
          re[k] = especRe[fila + k]! * m[fila + k]!;
          im[k] = especIm[fila + k]! * m[fila + k]!;
        }
        sumarCuadro(re, im, f0 + t, fft, salida[c]!, pesos[c]!);
      }
    }
    post({ type: 'progress', value: (b + 1) / bloques });
  }
  normalizar(salida[0]!, pesos[0]!);
  normalizar(salida[1]!, pesos[1]!);
  post({ type: 'done', izq: salida[0]!, der: salida[1]! }, [salida[0]!.buffer, salida[1]!.buffer]);
}

self.onmessage = (e: MessageEvent<SepararRequest>) => {
  if (e.data.type !== 'run') return;
  separar(e.data).catch((err: unknown) =>
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) }),
  );
};
