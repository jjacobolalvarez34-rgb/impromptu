/// <reference lib="webworker" />
import * as ort from 'onnxruntime-web/wasm';
import wasmUrl from 'onnxruntime-web/ort-wasm-simd-threaded.wasm?url';
import { PIANO_KEYS, joinSegments, outputsToEvents, splitSegments } from './postprocess';
import type { PianoNote, PianoPedal } from './postprocess';

/**
 * Worker del modelo de piano con pedal (Kong et al., ADR-014). Corre el modelo ONNX con
 * onnxruntime-web en el procesador (WASM, varios hilos si la página está aislada) y devuelve
 * notas y pedal de sustain. El modelo se descarga una vez y queda en la caché del navegador.
 *
 * WebGPU se probó en el portátil de Jacobo (Intel HD 4600) y se quedó en 0 % por 15 minutos,
 * congelando la página: por eso no se intenta. Se reevaluará con un equipo más nuevo.
 */
export type PianoWorkerRequest = { type: 'run'; samples: Float32Array; modelUrl: string };

export type PianoWorkerMessage =
  | { type: 'download'; loaded: number; total: number }
  | { type: 'ready'; backend: 'webgpu' | 'wasm'; threads: number }
  | { type: 'progress'; value: number }
  | { type: 'done'; notes: PianoNote[]; pedals: PianoPedal[] }
  | { type: 'error'; message: string };

const post = (m: PianoWorkerMessage) => (self as unknown as Worker).postMessage(m);

const CACHE = 'impromptu-modelos-v1';

/** Descarga el modelo con avance, o lo lee de la caché (sin internet después de la primera vez). */
async function loadModel(url: string): Promise<Uint8Array> {
  const cache = 'caches' in self ? await caches.open(CACHE) : null;
  const cached = await cache?.match(url);
  if (cached) return new Uint8Array(await cached.arrayBuffer());
  const response = await fetch(url);
  if (!response.ok || !response.body)
    throw new Error(`No se pudo descargar el modelo (${response.status})`);
  const total = Number(response.headers.get('content-length') ?? 0);
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    post({ type: 'download', loaded, total });
  }
  const bytes = new Uint8Array(loaded);
  let at = 0;
  for (const c of chunks) {
    bytes.set(c, at);
    at += c.length;
  }
  await cache?.put(
    url,
    new Response(bytes, { headers: { 'content-type': 'application/octet-stream' } }),
  );
  return bytes;
}

let session: Promise<ort.InferenceSession> | null = null;

function getSession(url: string): Promise<ort.InferenceSession> {
  session ??= (async () => {
    ort.env.wasm.wasmPaths = { wasm: wasmUrl };
    // Varios hilos solo si la página está aislada (COOP/COEP); si no, uno solo.
    const threads = self.crossOriginIsolated
      ? Math.max(1, Math.min(8, navigator.hardwareConcurrency || 4))
      : 1;
    ort.env.wasm.numThreads = threads;
    const model = await loadModel(url);
    const s = await ort.InferenceSession.create(model, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
    });
    post({ type: 'ready', backend: 'wasm', threads });
    return s;
  })();
  session.catch(() => (session = null));
  return session;
}

const OUTPUTS = {
  regOnset: 'reg_onset_output',
  regOffset: 'reg_offset_output',
  frame: 'frame_output',
  velocity: 'velocity_output',
  pedalOffset: 'reg_pedal_offset_output',
  pedalFrame: 'pedal_frame_output',
} as const;

async function run(samples: Float32Array, modelUrl: string) {
  const s = await getSession(modelUrl);
  const segments = splitSegments(samples);
  const parts: Record<keyof typeof OUTPUTS, Float32Array[]> = {
    regOnset: [],
    regOffset: [],
    frame: [],
    velocity: [],
    pedalOffset: [],
    pedalFrame: [],
  };
  post({ type: 'progress', value: 0 });
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    const result = await s.run({ audio: new ort.Tensor('float32', seg, [1, seg.length]) });
    for (const [key, name] of Object.entries(OUTPUTS) as [keyof typeof OUTPUTS, string][]) {
      // Se copia: los tensores de salida pueden reutilizar su memoria en la siguiente corrida.
      parts[key].push(new Float32Array(result[name]!.data as Float32Array));
    }
    post({ type: 'progress', value: (i + 1) / segments.length });
  }
  const join = (key: keyof typeof OUTPUTS, columns: number) => joinSegments(parts[key], columns);
  const frame = join('frame', PIANO_KEYS);
  const { notes, pedals } = outputsToEvents({
    frames: frame.length / PIANO_KEYS,
    regOnset: join('regOnset', PIANO_KEYS),
    regOffset: join('regOffset', PIANO_KEYS),
    frame,
    velocity: join('velocity', PIANO_KEYS),
    pedalOffset: join('pedalOffset', 1),
    pedalFrame: join('pedalFrame', 1),
  });
  post({ type: 'done', notes, pedals });
}

self.onmessage = async (e: MessageEvent<PianoWorkerRequest>) => {
  try {
    await run(e.data.samples, e.data.modelUrl);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
};
