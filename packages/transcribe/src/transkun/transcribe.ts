import { createNoteEvent, createTake, createTrack, fitKeyboardRange } from '@impromptu/core';
import type { PedalEvent, PedalKind, Take } from '@impromptu/core';
import { TranscriptionCancelled } from '../transcribe';
import type { TkNote } from './decode';
import type { TranskunMessage, TranskunRequest } from './worker';

/** Frecuencia de muestreo de Transkun. */
export const TRANSKUN_RATE = 44_100;

export type TranskunStage =
  | { stage: 'downloading'; loaded: number; total: number }
  | { stage: 'preparing' }
  | { stage: 'listening'; progress: number; threads: number };

async function toRate(buffer: AudioBuffer): Promise<Float32Array> {
  const length = Math.ceil(buffer.duration * TRANSKUN_RATE);
  const ctx = new OfflineAudioContext(1, length, TRANSKUN_RATE);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
  return (await ctx.startRendering()).getChannelData(0);
}

/**
 * Transcribe piano con Transkun V2 (notas, fuerza, sustain y una corda) en un worker.
 * `baseUrl`: carpeta de donde se bajan sus archivos (termina en /). Cancelar termina el worker.
 */
export async function transcribeTranskun(
  buffer: AudioBuffer,
  options: { baseUrl: string; onStage?: (s: TranskunStage) => void; signal?: AbortSignal },
): Promise<TkNote[]> {
  const samples = await toRate(buffer);
  if (options.signal?.aborted) throw new TranscriptionCancelled();
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  options.onStage?.({ stage: 'preparing' });
  let threads = 1;
  return new Promise((resolve, reject) => {
    const finish = () => {
      worker.terminate();
      options.signal?.removeEventListener('abort', stop);
    };
    const stop = () => {
      finish();
      reject(new TranscriptionCancelled());
    };
    options.signal?.addEventListener('abort', stop, { once: true });
    worker.onmessage = (e: MessageEvent<TranskunMessage>) => {
      const m = e.data;
      if (m.type === 'download') options.onStage?.({ stage: 'downloading', ...m });
      else if (m.type === 'ready') {
        threads = m.threads;
        options.onStage?.({ stage: 'listening', progress: 0, threads });
      } else if (m.type === 'progress')
        options.onStage?.({ stage: 'listening', progress: m.value, threads });
      else {
        finish();
        if (m.type === 'done') resolve(m.notes);
        else reject(new Error(m.message));
      }
    };
    worker.onerror = (e) => {
      finish();
      reject(new Error(e.message));
    };
    const request: TranskunRequest = { type: 'run', samples, baseUrl: options.baseUrl };
    worker.postMessage(request, [samples.buffer]);
  });
}

const PEDAL_OF: Record<number, PedalKind> = { [-64]: 'sustain', [-67]: 'soft' };

/**
 * Toma a partir de lo que dio Transkun: las teclas son notas (origin 'audio') y los símbolos
 * -64 y -67 son el sustain y la una corda (pisado de inicio a fin).
 */
export function takeFromTranskun(events: readonly TkNote[], title: string, duration: number): Take {
  const notes = events
    .filter((e) => e.pitch >= 0 && e.end > e.start)
    .map((e) =>
      createNoteEvent({
        pitch: e.pitch,
        start: e.start,
        end: e.end,
        velocity: Math.min(127, Math.max(1, Math.round(e.velocity))),
        origin: 'audio',
      }),
    );
  const pedals: PedalEvent[] = events
    .filter((e) => PEDAL_OF[e.pitch] !== undefined)
    .flatMap((e) => [
      { kind: PEDAL_OF[e.pitch]!, time: e.start, value: 127 },
      { kind: PEDAL_OF[e.pitch]!, time: e.end, value: 0 },
    ])
    .sort((a, b) => a.time - b.time);
  return createTake({
    title,
    tracks: [createTrack({ name: 'Piano (transcrito)', notes, pedals })],
    duration: Math.max(duration, ...notes.map((n) => n.end), 0),
    keyboardRange: fitKeyboardRange(notes.map((n) => n.pitch)),
  });
}
