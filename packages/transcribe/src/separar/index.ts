import { TranscriptionCancelled } from '../transcribe';
import type { Parte } from './spleeter';
import type { SepararMessage, SepararRequest } from './worker';

export type { Parte } from './spleeter';

/** Frecuencia con la que trabaja Spleeter. */
const TASA = 44_100;

export type SepararEtapa =
  | { stage: 'downloading'; loaded: number; total: number }
  | { stage: 'preparing' }
  | { stage: 'separating'; progress: number };

/** La parte de cada instrumento: la guitarra va en "otros". */
export const PARTE_DE = { guitar: 'other', bass: 'bass', drums: 'drums' } as const;

/**
 * Separa un instrumento de una canción completa (pedido 35, como Moises) con Spleeter en un
 * worker. Devuelve solo esa parte, en estéreo a 44,1 kHz. Cancelar termina el worker.
 */
export async function separarInstrumento(
  buffer: AudioBuffer,
  parte: Parte,
  options: { baseUrl: string; onStage?: (s: SepararEtapa) => void; signal?: AbortSignal },
): Promise<AudioBuffer> {
  // A 44,1 kHz y en estéreo (un audio mono se duplica).
  const largo = Math.ceil(buffer.duration * TASA);
  const ctx = new OfflineAudioContext(2, largo, TASA);
  const fuente = ctx.createBufferSource();
  fuente.buffer = buffer;
  fuente.connect(ctx.destination);
  fuente.start();
  const estereo = await ctx.startRendering();
  if (options.signal?.aborted) throw new TranscriptionCancelled();
  const izq = estereo.getChannelData(0).slice();
  const der = estereo.getChannelData(1).slice();

  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  options.onStage?.({ stage: 'preparing' });
  return new Promise((resolve, reject) => {
    const terminar = () => {
      worker.terminate();
      options.signal?.removeEventListener('abort', parar);
    };
    const parar = () => {
      terminar();
      reject(new TranscriptionCancelled());
    };
    options.signal?.addEventListener('abort', parar, { once: true });
    worker.onmessage = (e: MessageEvent<SepararMessage>) => {
      const m = e.data;
      if (m.type === 'download') options.onStage?.({ stage: 'downloading', ...m });
      else if (m.type === 'ready') options.onStage?.({ stage: 'separating', progress: 0 });
      else if (m.type === 'progress') options.onStage?.({ stage: 'separating', progress: m.value });
      else {
        terminar();
        if (m.type === 'done') {
          const salida = new AudioBuffer({
            length: m.izq.length,
            numberOfChannels: 2,
            sampleRate: TASA,
          });
          salida.copyToChannel(m.izq as Float32Array<ArrayBuffer>, 0);
          salida.copyToChannel(m.der as Float32Array<ArrayBuffer>, 1);
          resolve(salida);
        } else reject(new Error(m.message));
      }
    };
    worker.onerror = (e) => {
      terminar();
      reject(new Error(e.message));
    };
    const pedido: SepararRequest = { type: 'run', izq, der, parte, baseUrl: options.baseUrl };
    worker.postMessage(pedido, [izq.buffer, der.buffer]);
  });
}
