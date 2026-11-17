import type { RawNote } from './notes';
import type { TranscribeParams, WorkerMessage } from './worker';

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

/**
 * Transcribe un audio a notas en un Web Worker. Cancelar termina el worker de inmediato
 * (no queda colgado consumiendo memoria; VERIFICACIONES §6).
 */
export async function transcribe(
  buffer: AudioBuffer,
  options: {
    onProgress?: (value: number) => void;
    signal?: AbortSignal;
    params?: Partial<TranscribeParams>;
  } = {},
): Promise<RawNote[]> {
  const samples = await toModelRate(buffer);
  if (options.signal?.aborted) throw new TranscriptionCancelled();
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  return new Promise<RawNote[]>((resolve, reject) => {
    const stop = () => {
      worker.terminate();
      reject(new TranscriptionCancelled());
    };
    options.signal?.addEventListener('abort', stop, { once: true });
    worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const m = e.data;
      if (m.type === 'progress') options.onProgress?.(m.value);
      else {
        worker.terminate();
        options.signal?.removeEventListener('abort', stop);
        if (m.type === 'done') resolve(m.notes);
        else reject(new Error(m.message));
      }
    };
    worker.onerror = (e) => {
      worker.terminate();
      reject(new Error(e.message));
    };
    const params = { ...DEFAULT_PARAMS, ...options.params };
    worker.postMessage({ samples, params }, [samples.buffer]);
  });
}
