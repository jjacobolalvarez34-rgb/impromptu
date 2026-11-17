import { createNoteEvent, createTake, createTrack, fitKeyboardRange } from '@impromptu/core';
import type { PedalEvent, Take } from '@impromptu/core';
import { TranscriptionCancelled } from '../transcribe';
import { PIANO_SAMPLE_RATE } from './postprocess';
import type { PianoNote, PianoPedal } from './postprocess';
import type { PianoWorkerMessage, PianoWorkerRequest } from './worker';

/** En qué va: bajando el modelo (la primera vez), preparándolo o escuchando. */
export type PianoStage =
  | { stage: 'downloading'; loaded: number; total: number }
  | { stage: 'preparing' }
  | { stage: 'listening'; progress: number; backend: 'webgpu' | 'wasm'; threads: number };

/** Remuestrea a mono 16 kHz, lo que espera el modelo de piano. */
async function toPianoRate(buffer: AudioBuffer): Promise<Float32Array> {
  const length = Math.ceil(buffer.duration * PIANO_SAMPLE_RATE);
  const ctx = new OfflineAudioContext(1, length, PIANO_SAMPLE_RATE);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
  return (await ctx.startRendering()).getChannelData(0);
}

/**
 * Transcribe piano con el modelo de Kong et al. (notas, fuerza y pedal de sustain), en un
 * worker. Cancelar termina el worker de inmediato.
 */
export async function transcribePiano(
  buffer: AudioBuffer,
  options: {
    modelUrl: string;
    onStage?: (s: PianoStage) => void;
    signal?: AbortSignal;
  },
): Promise<{ notes: PianoNote[]; pedals: PianoPedal[] }> {
  const samples = await toPianoRate(buffer);
  if (options.signal?.aborted) throw new TranscriptionCancelled();
  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  options.onStage?.({ stage: 'preparing' });
  let threads = 1;
  let backend: 'webgpu' | 'wasm' = 'wasm';
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
    worker.onmessage = (e: MessageEvent<PianoWorkerMessage>) => {
      const m = e.data;
      if (m.type === 'download') options.onStage?.({ stage: 'downloading', ...m });
      else if (m.type === 'ready') {
        threads = m.threads;
        backend = m.backend;
        options.onStage?.({ stage: 'listening', progress: 0, backend, threads });
      } else if (m.type === 'progress')
        options.onStage?.({ stage: 'listening', progress: m.value, backend, threads });
      else {
        finish();
        if (m.type === 'done') resolve({ notes: m.notes, pedals: m.pedals });
        else reject(new Error(m.message));
      }
    };
    worker.onerror = (e) => {
      finish();
      reject(new Error(e.message));
    };
    const request: PianoWorkerRequest = { type: 'run', samples, modelUrl: options.modelUrl };
    worker.postMessage(request, [samples.buffer]);
  });
}

/** Toma a partir de la transcripción de piano: notas de audio y pedal de sustain (CC64). */
export function takeFromPiano(
  result: { notes: readonly PianoNote[]; pedals: readonly PianoPedal[] },
  title: string,
  duration: number,
): Take {
  const notes = result.notes
    .filter((n) => n.end > n.start)
    .map((n) =>
      createNoteEvent({
        pitch: n.pitch,
        start: Math.max(0, n.start),
        end: n.end,
        velocity: n.velocity,
        origin: 'audio',
      }),
    );
  const pedals: PedalEvent[] = result.pedals.flatMap((p) => [
    { kind: 'sustain' as const, time: Math.max(0, p.start), value: 127 },
    { kind: 'sustain' as const, time: Math.max(p.start, p.end), value: 0 },
  ]);
  return createTake({
    title,
    tracks: [createTrack({ name: 'Piano (transcrito)', notes, pedals })],
    duration: Math.max(duration, ...notes.map((n) => n.end), 0),
    keyboardRange: fitKeyboardRange(notes.map((n) => n.pitch)),
  });
}
