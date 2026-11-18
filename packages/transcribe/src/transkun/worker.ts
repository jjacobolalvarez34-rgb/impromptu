/// <reference lib="webworker" />
import * as ort from 'onnxruntime-web/wasm';
import wasmUrl from 'onnxruntime-web/ort-wasm-simd-threaded.wasm?url';
import { finishEvents, mergeSegment, segmentNotes, viterbiBackward } from './decode';
import type { TkNote } from './decode';
import { frameCount, segmentFeatures } from './spectrum';
import type { SpectrumConsts } from './spectrum';

/**
 * Worker de Transkun V2 (ADR-015): piano con pedal, el modelo más preciso que se probó con las
 * grabaciones de Jacobo. Red y cabezas en ONNX (onnxruntime-web, WASM con varios hilos); el
 * espectro y la decodificación, en TypeScript. Los archivos se descargan una vez y quedan en caché.
 */
export type TranskunRequest = { type: 'run'; samples: Float32Array; baseUrl: string };

export type TranskunMessage =
  | { type: 'download'; loaded: number; total: number }
  | { type: 'ready'; threads: number }
  | { type: 'progress'; value: number }
  | { type: 'done'; notes: TkNote[] }
  | { type: 'error'; message: string };

const post = (m: TranskunMessage) => (self as unknown as Worker).postMessage(m);
const CACHE = 'impromptu-modelos-v1';
const FILES = {
  red: 'transkun-red.onnx',
  cabezas: 'transkun-cabezas.onnx',
  ventanas: 'transkun-ventanas.f32',
  mel: 'transkun-mel.f32',
  espectro: 'transkun-espectro.json',
} as const;
/** Tamaño aproximado del paquete, para el avance mientras se conoce el real (bytes). */
const APPROX_TOTAL = 58e6;

interface Bundle {
  red: ort.InferenceSession;
  cabezas: ort.InferenceSession;
  consts: SpectrumConsts & {
    segmentSize: number;
    segmentHop: number;
    symbols: number[];
  };
  threads: number;
}

/** Descarga los archivos con avance conjunto, o los lee de la caché. */
async function loadFiles(baseUrl: string): Promise<Record<keyof typeof FILES, ArrayBuffer>> {
  const cache = 'caches' in self ? await caches.open(CACHE) : null;
  const entries = Object.entries(FILES) as [keyof typeof FILES, string][];
  const loaded: Record<string, number> = {};
  const totals: Record<string, number> = {};
  const report = () => {
    const l = Object.values(loaded).reduce((a, b) => a + b, 0);
    const t = Math.max(
      APPROX_TOTAL,
      Object.values(totals).reduce((a, b) => a + b, 0),
    );
    post({ type: 'download', loaded: l, total: t });
  };
  const out = await Promise.all(
    entries.map(async ([key, name]) => {
      const url = `${baseUrl}${name}`;
      const cached = await cache?.match(url);
      if (cached) return [key, await cached.arrayBuffer()] as const;
      const response = await fetch(url);
      if (!response.ok || !response.body)
        throw new Error(`No se pudo descargar ${name} (${response.status})`);
      totals[key] = Number(response.headers.get('content-length') ?? 0);
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        size += value.length;
        loaded[key] = size;
        report();
      }
      const bytes = new Uint8Array(size);
      let at = 0;
      for (const c of chunks) {
        bytes.set(c, at);
        at += c.length;
      }
      await cache?.put(url, new Response(bytes));
      return [key, bytes.buffer] as const;
    }),
  );
  return Object.fromEntries(out) as Record<keyof typeof FILES, ArrayBuffer>;
}

let bundle: Promise<Bundle> | null = null;

function getBundle(baseUrl: string): Promise<Bundle> {
  bundle ??= (async () => {
    ort.env.wasm.wasmPaths = { wasm: wasmUrl };
    const threads = self.crossOriginIsolated
      ? Math.max(1, Math.min(8, navigator.hardwareConcurrency || 4))
      : 1;
    ort.env.wasm.numThreads = threads;
    const files = await loadFiles(baseUrl);
    const options: ort.InferenceSession.SessionOptions = {
      executionProviders: ['wasm'],
      // 'extended': prepara en ~13 s y cada segmento tarda ~36 s en el portátil de Jacobo.
      // 'all' tarda ~100 s en preparar (25 s por segmento); conviene solo en piezas largas.
      graphOptimizationLevel: 'extended',
    };
    const [red, cabezas] = await Promise.all([
      ort.InferenceSession.create(new Uint8Array(files.red), options),
      ort.InferenceSession.create(new Uint8Array(files.cabezas), options),
    ]);
    const meta = JSON.parse(new TextDecoder().decode(files.espectro)) as Omit<
      Bundle['consts'],
      'windows' | 'freq2mels'
    >;
    const b: Bundle = {
      red,
      cabezas,
      consts: {
        ...meta,
        windows: new Float32Array(files.ventanas),
        freq2mels: new Float32Array(files.mel),
      },
      threads,
    };
    post({ type: 'ready', threads });
    return b;
  })();
  bundle.catch(() => (bundle = null));
  return bundle;
}

/** Transcribe audio mono a `consts.fs` (44,1 kHz), por segmentos de 16 s que avanzan de a 8 s. */
async function run(samples: Float32Array, baseUrl: string) {
  const { red, cabezas, consts } = await getBundle(baseUrl);
  const { fs, hopSize: hop, nMels, symbols } = consts;
  const nWins = consts.windows.length / consts.windowSize;
  const nSym = symbols.length;
  const padBegin = consts.segmentSize - consts.segmentHop;
  const padSamples = Math.ceil(padBegin * fs);
  const padded = new Float32Array(samples.length + 2 * padSamples);
  padded.set(samples, padSamples);
  const stepSize = Math.ceil((consts.segmentHop * fs) / hop) * hop;
  const segmentSize = Math.ceil(consts.segmentSize * fs);
  const lastFrameIdx = Math.round(segmentSize / hop);
  const frameDur = hop / fs;
  let startPos = Array<number>(nSym).fill(Math.floor((padBegin * fs) / hop));
  const byType = new Map<number, TkNote[]>();
  const steps = Math.ceil(padded.length / stepSize);

  post({ type: 'progress', value: 0 });
  for (let step = 0, i = 0; i < padded.length; step++, i += stepSize) {
    const slice = new Float32Array(segmentSize);
    slice.set(padded.subarray(i, Math.min(i + segmentSize, padded.length)));
    const beginTime = i / fs - padBegin;
    const T = frameCount(segmentSize, hop);
    const features = segmentFeatures([slice], consts);
    // Avisos dentro del segmento: la barra se mueve más seguido.
    post({ type: 'progress', value: (step + 0.1) / steps });
    const out = await red.run({
      features: new ort.Tensor('float32', features, [1, T, nMels, nWins]),
    });
    const S = out.S!.data as Float32Array;
    const skip = out.S_skip!.data as Float32Array;
    const ctx = out.ctx!.data as Float32Array;
    const D = ctx.length / (nSym * T);
    post({ type: 'progress', value: (step + 0.85) / steps });
    const intervals = viterbiBackward(S, skip, T, nSym, startPos);
    const total = intervals.reduce((a, l) => a + l.length, 0);

    let velocity = new Float32Array(0);
    let of = new Float32Array(0);
    if (total > 0) {
      const attr = new Float32Array(total * D * 3);
      let n = 0;
      intervals.forEach((list, s) => {
        for (const [a, b] of list) {
          const base = n * D * 3;
          for (let d = 0; d < D; d++) {
            const va = ctx[(s * T + a) * D + d]!;
            const vb = ctx[(s * T + b) * D + d]!;
            attr[base + d] = va;
            attr[base + D + d] = vb;
            attr[base + 2 * D + d] = va * vb;
          }
          n++;
        }
      });
      const h = await cabezas.run({ attr: new ort.Tensor('float32', attr, [total, D * 3]) });
      velocity = new Float32Array(h.velocity!.data as Float32Array);
      of = new Float32Array(h.of!.data as Float32Array);
    }
    const { notes, lastP } = segmentNotes(intervals, symbols, velocity, of, frameDur, lastFrameIdx);
    startPos = lastP.map((k) => Math.max(k - Math.trunc(stepSize / hop), 0));
    for (const e of notes) {
      e.start = Math.max(e.start + beginTime, 0);
      e.end = Math.max(e.end + beginTime, e.start);
    }
    mergeSegment(byType, notes);
    for (const t of Object.values(out)) t.dispose();
    post({ type: 'progress', value: (step + 1) / steps });
  }
  post({ type: 'done', notes: finishEvents(byType) });
}

self.onmessage = async (e: MessageEvent<TranskunRequest>) => {
  try {
    await run(e.data.samples, e.data.baseUrl);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
};
