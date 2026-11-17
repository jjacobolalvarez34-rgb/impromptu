/// <reference lib="webworker" />
import './worker-shim';
import {
  BasicPitch,
  addPitchBendsToNoteEvents,
  noteFramesToTime,
  outputToNotesPoly,
} from '@spotify/basic-pitch';
import * as tf from '@tensorflow/tfjs';
import modelUrl from '@spotify/basic-pitch/model/model.json?url';
import weightsUrl from '@spotify/basic-pitch/model/group1-shard1of1.bin?url';

/**
 * Worker de transcripción (ARQUITECTURA, fase 5): corre Basic Pitch con TensorFlow.js fuera
 * del hilo de la interfaz. Recibe audio mono a 22 050 Hz y devuelve las notas.
 * El modelo viene empaquetado con la app: funciona sin conexión.
 */
/** Umbrales de Basic Pitch para pasar de probabilidades a notas. */
export interface TranscribeParams {
  /** Probabilidad mínima de ataque (0–1). Más alto: menos notas falsas, más notas perdidas. */
  onsetThreshold: number;
  /** Probabilidad mínima para que la nota siga sonando (0–1). */
  frameThreshold: number;
  /** Largo mínimo de una nota, en cuadros del modelo (unos 11.6 ms cada uno). */
  minNoteFrames: number;
}

export type WorkerRequest = { samples: Float32Array; params: TranscribeParams };
export type WorkerMessage =
  | { type: 'progress'; value: number }
  | {
      type: 'done';
      notes: {
        startTimeSeconds: number;
        durationSeconds: number;
        pitchMidi: number;
        amplitude: number;
      }[];
    }
  | { type: 'error'; message: string };

const post = (m: WorkerMessage) => (self as unknown as Worker).postMessage(m);

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  try {
    // El archivo de pesos se sirve con nombre propio (Vite le pone un hash): se le indica a TF.
    const model = tf.loadGraphModel(modelUrl, { weightUrlConverter: async () => weightsUrl });
    const basicPitch = new BasicPitch(model);
    const frames: number[][] = [];
    const onsets: number[][] = [];
    const contours: number[][] = [];
    await basicPitch.evaluateModel(
      e.data.samples,
      (f, o, c) => {
        frames.push(...f);
        onsets.push(...o);
        contours.push(...c);
      },
      (p) => post({ type: 'progress', value: p }),
    );
    const notes = noteFramesToTime(
      addPitchBendsToNoteEvents(
        contours,
        outputToNotesPoly(
          frames,
          onsets,
          e.data.params.onsetThreshold,
          e.data.params.frameThreshold,
          e.data.params.minNoteFrames,
        ),
      ),
    );
    post({
      type: 'done',
      notes: notes.map((n) => ({
        startTimeSeconds: n.startTimeSeconds,
        durationSeconds: n.durationSeconds,
        pitchMidi: n.pitchMidi,
        amplitude: n.amplitude,
      })),
    });
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
};
