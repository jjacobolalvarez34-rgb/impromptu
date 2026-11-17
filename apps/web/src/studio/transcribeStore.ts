import {
  TranscriptionCancelled,
  peakLevel,
  prepareTranscriber,
  takeFromTranscription,
  takeFromTranskun,
  transcribe,
  transcribeTranskun,
} from '@impromptu/transcribe';
import type { Take } from '@impromptu/core';
import { create } from 'zustand';
import { engine } from './audio';
import { refreshTakes, useLive } from './live';
import { LiveListener } from './liveMic';
import { saveMedia } from './mediaStore';
import { useStudio } from './store';
import { saveTake } from './takesDb';

/**
 * Audio a notas (fase 5, ADR-013 y ADR-014): grabar con el micrófono o convertir un archivo.
 * El estado vive aquí para que el botón del micrófono, el de convertir y el aviso de avance
 * puedan estar en distintos lugares del panel. Cada resultado se guarda en "Tus grabaciones"
 * con su audio, como las tomas del teclado.
 */
export type Model = 'piano' | 'rapido';

export type TranscribeState =
  | { step: 'idle' }
  | { step: 'recording'; device: string }
  /** `progress` null: avance indeterminado (preparando). */
  | { step: 'working'; label: string; progress: number | null; name: string }
  | { step: 'error'; message: string };

/**
 * Carpeta del modelo de piano con pedal (Transkun, ADR-015). En desarrollo se sirve desde la
 * carpeta local de modelos; para la web publicada hace falta VITE_PIANO_MODEL_URL. PROVISIONAL(P21).
 */
export const PIANO_MODEL_URL: string | null =
  (import.meta.env.VITE_PIANO_MODEL_URL as string | undefined) ??
  (import.meta.env.DEV ? `${import.meta.env.BASE_URL}modelos/` : null);

/** Por debajo de esto (unos −50 dB) el audio se considera silencio. */
const SILENCE = 0.003;
const AUDIO_PREFIX = 'Grabación de audio';

interface Store {
  state: TranscribeState;
  model: Model;
  setModel: (model: Model) => void;
  /** Vuelve al estado inicial (cerrar un aviso de error). */
  reset: () => void;
  cancel: () => void;
  startMic: () => Promise<void>;
  stopMic: () => void;
  convert: (file: File) => void;
}

let abort: AbortController | null = null;
let recorder: MediaRecorder | null = null;
let stream: MediaStream | null = null;
let listener: LiveListener | null = null;

const mb = (bytes: number) => Math.round(bytes / 1e6);

/** "Grabación de audio N", con N uno más que la mayor que ya existe. */
function nextAudioName(): string {
  const used = useLive
    .getState()
    .takes.map((t) => /^Grabación de audio (\d+)$/.exec(t.title)?.[1])
    .filter((n): n is string => n !== undefined)
    .map(Number);
  return `${AUDIO_PREFIX} ${Math.max(0, ...used) + 1}`;
}

export const useTranscribe = create<Store>((set, get) => {
  const show = (label: string, progress: number | null) =>
    set((s) => (s.state.step === 'working' ? { state: { ...s.state, label, progress } } : s));

  const run = async (blob: Blob, name: string, fromMic: boolean) => {
    const controller = new AbortController();
    abort = controller;
    set({ state: { step: 'working', label: `Escuchando «${name}»…`, progress: null, name } });
    try {
      const buffer = await engine.audioContext.decodeAudioData(await blob.arrayBuffer());
      if (peakLevel(buffer) < SILENCE) {
        set({
          state: {
            step: 'error',
            message: fromMic
              ? 'No llegó sonido del micrófono. Revisa en el candado de la barra de direcciones cuál micrófono usa el navegador, o acerca el micrófono al piano.'
              : 'Ese audio está en silencio.',
          },
        });
        return;
      }
      let take: Take;
      if (get().model === 'piano' && PIANO_MODEL_URL) {
        const result = await transcribeTranskun(buffer, {
          baseUrl: PIANO_MODEL_URL,
          signal: controller.signal,
          onStage: (st) => {
            if (st.stage === 'downloading')
              show(
                `Descargando el modelo de piano (${mb(st.total || 58e6)} MB, solo la primera vez)…`,
                st.total ? st.loaded / st.total : null,
              );
            else if (st.stage === 'preparing') show('Preparando el modelo de piano…', null);
            else
              show(
                `Escuchando «${name}» (procesador, ${st.threads} ${st.threads === 1 ? 'hilo' : 'hilos'})…`,
                st.progress,
              );
          },
        });
        take = takeFromTranskun(result, name, buffer.duration);
      } else {
        const raw = await transcribe(buffer, {
          signal: controller.signal,
          onStage: (stage) =>
            show(
              stage === 'preparing'
                ? 'Preparando la IA. Solo la primera vez; puede tardar hasta medio minuto.'
                : `Escuchando «${name}»…`,
              stage === 'preparing' ? null : 0,
            ),
          onProgress: (progress) => show(`Escuchando «${name}»…`, progress),
        });
        take = takeFromTranscription(raw, name, buffer.duration);
      }
      if (take.tracks[0]!.notes.length === 0) {
        set({
          state: {
            step: 'error',
            message:
              'Se oyó sonido, pero no encontramos notas de piano. Prueba con el micrófono más cerca del piano o con menos ruido alrededor.',
          },
        });
        return;
      }
      // Se guarda con su audio (las notas salieron de él: desfase 0) en "Tus grabaciones".
      const ext = blob.type.includes('webm') ? 'webm' : blob.type.includes('ogg') ? 'ogg' : 'audio';
      const key = `${take.id}.${ext}`;
      await saveMedia(blob, key);
      take.media.push({ kind: 'audio', storageKey: key, offset: 0 });
      await saveTake(take);
      await refreshTakes();
      useStudio.getState().open(take);
      set({ state: { step: 'idle' } });
    } catch (e) {
      if (e instanceof TranscriptionCancelled) set({ state: { step: 'idle' } });
      else
        set({
          state: {
            step: 'error',
            message: 'No pudimos convertir ese audio. Prueba con MP3, WAV, M4A o FLAC.',
          },
        });
    } finally {
      abort = null;
    }
  };

  return {
    state: { step: 'idle' },
    model: PIANO_MODEL_URL ? 'piano' : 'rapido',
    setModel: (model) => set({ model }),
    reset: () => set({ state: { step: 'idle' } }),
    cancel: () => abort?.abort(),

    startMic: async () => {
      void engine.start();
      // La IA rápida escucha en vivo mientras se graba (las notas suben al tocar).
      prepareTranscriber();
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        });
      } catch {
        set({
          state: {
            step: 'error',
            message:
              'No diste permiso para el micrófono. Actívalo en el candado de la barra de direcciones.',
          },
        });
        return;
      }
      const chunks: Blob[] = [];
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      rec.onstop = () => {
        listener?.stop();
        listener = null;
        for (const t of stream?.getTracks() ?? []) t.stop();
        stream = null;
        void run(new Blob(chunks, { type: rec.mimeType }), nextAudioName(), true);
      };
      rec.start(1000);
      recorder = rec;
      listener = new LiveListener();
      void listener.start(stream, engine.audioContext).catch(() => {
        // Sin AudioWorklet: se graba igual y se transcribe al detener.
        listener = null;
      });
      set({
        state: { step: 'recording', device: stream.getAudioTracks()[0]?.label || 'Micrófono' },
      });
    },

    stopMic: () => recorder?.stop(),

    convert: (file) => {
      if (get().model === 'rapido') prepareTranscriber();
      void run(file, file.name.replace(/\.[^.]+$/, ''), false);
    },
  };
});

/** Stream del micrófono mientras se graba (para el medidor de nivel). */
export const micStream = () => stream;
