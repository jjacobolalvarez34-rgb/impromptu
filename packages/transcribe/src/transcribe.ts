import type { RawNote } from './notes';
import type { TranscribeParams, WorkerMessage, WorkerRequest } from './worker';

/** Umbrales por defecto; se ajustaron con las grabaciones de Jacobo (BITÁCORA, fase 5). */
export const DEFAULT_PARAMS: TranscribeParams = {
  onsetThreshold: 0.6,
  frameThreshold: 0.4,
  minNoteFrames: 8,
};
export type { TranscribeParams };

/** Frecuencia que espera Basic Pitch. */
export const MODEL_RATE = 22_050;

export class TranscriptionCancelled extends Error {
  constructor() {
    super('cancelled');
  }
}

/** En qué va: preparando la IA (solo la primera vez) o escuchando el audio. */
export type TranscribeStage = 'preparing' | 'listening';

/** Remuestrea a mono 22 050 Hz con un OfflineAudioContext (ARQUITECTURA, transcripción). */
export async function toModelRate(buffer: AudioBuffer): Promise<Float32Array> {
  const length = Math.ceil(buffer.duration * MODEL_RATE);
  const ctx = new OfflineAudioContext(1, length, MODEL_RATE);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
  const out = await ctx.startRendering();
  return out.getChannelData(0);
}

/** Pico absoluto (0–1) de un audio: sirve para avisar si el micrófono no captó nada. */
export function peakLevel(buffer: AudioBuffer): number {
  let peak = 0;
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < data.length; i++) {
      const v = Math.abs(data[i]!);
      if (v > peak) peak = v;
    }
  }
  return peak;
}

/** Worker compartido: se prepara una vez y queda listo para las siguientes conversiones. */
let shared: { worker: Worker; ready: boolean; listeners: Set<(m: WorkerMessage) => void> } | null =
  null;

function getWorker() {
  if (shared) return shared;
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  const state = { worker, ready: false, listeners: new Set<(m: WorkerMessage) => void>() };
  worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
    if (e.data.type === 'ready') state.ready = true;
    for (const l of state.listeners) l(e.data);
  };
  worker.onerror = (e) => {
    for (const l of state.listeners) l({ type: 'error', message: e.message });
    dropWorker();
  };
  shared = state;
  return state;
}

function dropWorker() {
  shared?.worker.terminate();
  shared = null;
}

const send = (w: Worker, m: WorkerRequest, transfer: Transferable[] = []) =>
  w.postMessage(m, transfer);

/**
 * Empieza a preparar la IA en segundo plano (por ejemplo mientras el usuario graba o elige
 * un archivo). Es seguro llamarla varias veces.
 */
export function prepareTranscriber(): void {
  const w = getWorker();
  if (!w.ready) send(w.worker, { type: 'prepare' });
}

/**
 * Transcribe un audio a notas en un Web Worker. Cancelar termina el worker de inmediato
 * (no queda colgado consumiendo memoria; VERIFICACIONES §6); la próxima vez se prepara de nuevo.
 */
export async function transcribe(
  buffer: AudioBuffer,
  options: TranscribeOptions = {},
): Promise<RawNote[]> {
  const samples = await toModelRate(buffer);
  if (options.signal?.aborted) throw new TranscriptionCancelled();
  return transcribeSamples(samples, options);
}

export interface TranscribeOptions {
  onProgress?: (value: number) => void;
  onStage?: (stage: TranscribeStage) => void;
  signal?: AbortSignal;
  params?: Partial<TranscribeParams>;
}

/** ¿La IA rápida ya está preparada (la siguiente transcripción empieza de inmediato)? */
export const isTranscriberReady = () => shared?.ready === true;

/** Las corridas van de a una: el worker devuelve un resultado por pedido, en orden. */
let queue: Promise<unknown> = Promise.resolve();

/**
 * Transcribe muestras mono que ya están a 22 050 Hz (MODEL_RATE). Sirve para escuchar en vivo
 * por bloques, sin remuestrear cada vez. El arreglo se transfiere al worker (queda vacío).
 */
export function transcribeSamples(
  samples: Float32Array,
  options: TranscribeOptions = {},
): Promise<RawNote[]> {
  const job = queue.then(() => runSamples(samples, options));
  queue = job.catch(() => undefined);
  return job;
}

function runSamples(samples: Float32Array, options: TranscribeOptions): Promise<RawNote[]> {
  if (options.signal?.aborted) return Promise.reject(new TranscriptionCancelled());
  const w = getWorker();
  options.onStage?.(w.ready ? 'listening' : 'preparing');
  return new Promise<RawNote[]>((resolve, reject) => {
    const finish = () => {
      w.listeners.delete(listener);
      options.signal?.removeEventListener('abort', stop);
    };
    const stop = () => {
      finish();
      dropWorker();
      reject(new TranscriptionCancelled());
    };
    const listener = (m: WorkerMessage) => {
      if (m.type === 'ready') options.onStage?.('listening');
      else if (m.type === 'progress') options.onProgress?.(m.value);
      else {
        finish();
        if (m.type === 'done') resolve(m.notes);
        else reject(new Error(m.message));
      }
    };
    w.listeners.add(listener);
    options.signal?.addEventListener('abort', stop, { once: true });
    const params = { ...DEFAULT_PARAMS, ...options.params };
    send(w.worker, { type: 'run', samples, params }, [samples.buffer]);
  });
}
