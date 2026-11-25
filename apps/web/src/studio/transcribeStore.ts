import {
  PARAMS_CUERDAS,
  TranscriptionCancelled,
  detectarBateria,
  separarInstrumento,
  PARTE_DE,
  peakLevel,
  prepareTranscriber,
  takeFromTranscription,
  takeFromTranskun,
  transcribe,
  transcribeTranskun,
} from '@impromptu/transcribe';
import { AvanceSuave } from '@impromptu/transcribe';
import type { EtapaDeEspera } from '@impromptu/transcribe';
import type { Take } from '@impromptu/core';
import { create } from 'zustand';

/** Para los mensajes: "no encontramos notas de …". */
const NOMBRE_INSTRUMENTO: Record<string, string> = {
  piano: 'piano',
  guitar: 'guitarra',
  bass: 'bajo',
  drums: 'batería',
};
import { engine } from './audio';
import { refreshTakes, useLive } from './live';
import { LiveListener } from './liveMic';
import { saveMedia } from './mediaStore';
import { useStudio } from './store';
import { conInstrumento, tomaDeGolpes } from './Instrumento';
import { saveTake } from './takesDb';

/**
 * Audio a notas (fase 5, ADR-013 y ADR-014): grabar con el micrófono o convertir un archivo.
 * Las conversiones van en una cola (pedido de Jacobo, 2026-11-18): se puede grabar otra o
 * convertir otro archivo mientras la anterior trabaja; se hacen de a una para no llenar la
 * memoria.
 * El estado vive aquí para que el botón del micrófono, el de convertir y el aviso de avance
 * puedan estar en distintos lugares del panel. Cada resultado se guarda en "Tus grabaciones"
 * con su audio, como las tomas del teclado.
 */
export type Model = 'piano' | 'rapido';

export type TranscribeState =
  { step: 'idle' } | { step: 'recording'; device: string } | { step: 'error'; message: string };

/** Una conversión en la cola. `progreso` null: todavía sin avance real (preparando). */
export interface Conversion {
  id: number;
  name: string;
  etapa: EtapaDeEspera;
  /** Texto propio de la etapa (por ejemplo, cuántos MB se descargan). */
  detalle: string | null;
  progreso: number | null;
  /** Cuándo empezó a trabajar (performance.now()), o null si espera su turno. */
  inicio: number | null;
}

/**
 * Carpeta del modelo de piano con pedal (Transkun, ADR-015). En desarrollo se sirve desde la
 * carpeta local de modelos; para la web publicada hace falta VITE_PIANO_MODEL_URL. PROVISIONAL(P21).
 */
/**
 * Separador de instrumentos (pedido 35): en desarrollo, la carpeta local; si no, el repositorio
 * público de la conversión a ONNX (Apache-2.0, pesos MIT de Deezer). PROVISIONAL(P21): pasar a
 * la copia propia de Mamut Herd en Hugging Face cuando exista.
 */
export const SEPARADOR_URL =
  'https://huggingface.co/Best-Practice/spleeter-4stems-onnx/resolve/main/';

export const PIANO_MODEL_URL: string | null =
  (import.meta.env.VITE_PIANO_MODEL_URL as string | undefined) ??
  (import.meta.env.DEV ? `${import.meta.env.BASE_URL}modelos/` : null);

/** Por debajo de esto (unos −50 dB) el audio se considera silencio. */
const SILENCE = 0.003;
const AUDIO_PREFIX = 'Grabación de audio';

interface Store {
  state: TranscribeState;
  /** Conversiones: la primera es la que trabaja; las demás esperan su turno. */
  cola: Conversion[];
  model: Model;
  setModel: (model: Model) => void;
  /**
   * Pedido 35: con guitarra, bajo o batería, separar primero ese instrumento de la canción
   * (como Moises) antes de pasarlo a notas. Solo con archivos de audio, no con el micrófono.
   */
  separar: boolean;
  setSeparar: (separar: boolean) => void;
  /** Vuelve al estado inicial (cerrar un aviso de error). */
  reset: () => void;
  /** Cancela una conversión (o la que trabaja, si no se dice cuál). */
  cancel: (id?: number) => void;
  startMic: () => Promise<void>;
  stopMic: () => void;
  convert: (file: File) => void;
}

let abort: AbortController | null = null;
let actual: number | null = null;
let siguienteId = 1;
const pendientes: { id: number; blob: Blob; name: string; fromMic: boolean }[] = [];
let procesando = false;
/** Barra continua de cada conversión (fuera de React: se lee en cada cuadro). */
const avances = new Map<number, AvanceSuave>();

/** Lo que muestra la barra de una conversión ahora (0 a 1) y los segundos que faltan. */
export function avanceVisible(
  c: Conversion,
  ahora: number,
): { valor: number | null; restante: number | null } {
  if (c.etapa === 'descargando') return { valor: c.progreso ?? 0, restante: null };
  const a = avances.get(c.id);
  if (c.etapa !== 'escuchando' || !a) return { valor: null, restante: null };
  return { valor: a.valor(ahora), restante: a.restante(ahora) };
}
let recorder: MediaRecorder | null = null;
let stream: MediaStream | null = null;
let listener: LiveListener | null = null;

const mb = (bytes: number) => Math.round(bytes / 1e6);

/** "Grabación de audio N", con N uno más que la mayor que ya existe. */
function nextAudioName(): string {
  // También cuentan las que esperan en la cola (todavía no están guardadas).
  const used = [
    ...useLive.getState().takes.map((t) => t.title),
    ...useTranscribe.getState().cola.map((c) => c.name),
  ]
    .map((title) => /^Grabación de audio (\d+)$/.exec(title)?.[1])
    .filter((n): n is string => n !== undefined)
    .map(Number);
  return `${AUDIO_PREFIX} ${Math.max(0, ...used) + 1}`;
}

export const useTranscribe = create<Store>((set, get) => {
  const cambiar = (id: number, c: Partial<Conversion>) =>
    set((s) => ({ cola: s.cola.map((x) => (x.id === id ? { ...x, ...c } : x)) }));
  const quitar = (id: number) => set((s) => ({ cola: s.cola.filter((x) => x.id !== id) }));
  const fallo = (name: string, message: string) =>
    set((s) =>
      s.state.step === 'recording'
        ? s
        : { state: { step: 'error', message: `«${name}»: ${message}` } },
    );

  const encolar = (blob: Blob, name: string, fromMic: boolean) => {
    const id = siguienteId++;
    pendientes.push({ id, blob, name, fromMic });
    set((s) => ({
      cola: [
        ...s.cola,
        { id, name, etapa: 'leyendo', detalle: null, progreso: null, inicio: null },
      ],
    }));
    void procesar();
  };

  const procesar = async () => {
    if (procesando) return;
    procesando = true;
    try {
      for (let job = pendientes.shift(); job; job = pendientes.shift()) {
        await run(job.id, job.blob, job.name, job.fromMic);
        quitar(job.id);
      }
    } finally {
      procesando = false;
    }
  };

  const run = async (id: number, blob: Blob, name: string, fromMic: boolean) => {
    const controller = new AbortController();
    abort = controller;
    actual = id;
    cambiar(id, { inicio: performance.now() });
    const show = (etapa: EtapaDeEspera, progreso: number | null, detalle: string | null = null) => {
      if (etapa === 'escuchando' && progreso !== null) {
        const ahora = performance.now();
        let a = avances.get(id);
        if (!a) avances.set(id, (a = new AvanceSuave(ahora, 0.1)));
        a.actualizar(progreso, ahora);
      }
      cambiar(id, { etapa, progreso, detalle });
    };
    try {
      const buffer = await engine.audioContext.decodeAudioData(await blob.arrayBuffer());
      if (peakLevel(buffer) < SILENCE) {
        fallo(
          name,
          fromMic
            ? 'No llegó sonido del micrófono. Revisa en el candado de la barra de direcciones cuál micrófono usa el navegador, o acerca el micrófono al piano.'
            : 'Ese audio está en silencio.',
        );
        return;
      }
      let take: Take;
      const instrumento = useStudio.getState().instrumento;
      // Canción completa: primero se separa el instrumento del resto (pedido 35).
      let fuente: AudioBuffer = buffer;
      if (!fromMic && get().separar && instrumento !== 'piano') {
        const nombreParte =
          instrumento === 'drums'
            ? 'la batería'
            : instrumento === 'bass'
              ? 'el bajo'
              : 'la guitarra';
        fuente = await separarInstrumento(buffer, PARTE_DE[instrumento], {
          baseUrl: PIANO_MODEL_URL ?? SEPARADOR_URL,
          signal: controller.signal,
          onStage: (st) => {
            if (st.stage === 'downloading')
              show(
                'descargando',
                st.total ? st.loaded / st.total : null,
                `Descargando el separador de instrumentos (${mb(st.total || 79e6)} MB, solo la primera vez)`,
              );
            else if (st.stage === 'preparing')
              show('preparando', null, 'Preparando el separador de instrumentos');
            else
              show('escuchando', st.progress, `Separando ${nombreParte} del resto de la canción`);
          },
        });
      }
      if (instrumento === 'drums') {
        show('escuchando', null, 'Buscando los golpes de la batería');
        const canales = Array.from({ length: fuente.numberOfChannels }, (_, i) =>
          fuente.getChannelData(i),
        );
        const mono = new Float32Array(fuente.length);
        for (const c of canales)
          for (let i = 0; i < mono.length; i++) mono[i] = mono[i]! + c[i]! / canales.length;
        take = tomaDeGolpes(
          detectarBateria(mono, fuente.sampleRate, 2 - useStudio.getState().sensibilidadBateria),
          name,
          buffer.duration,
        );
      } else if (get().model === 'piano' && PIANO_MODEL_URL && instrumento === 'piano') {
        const result = await transcribeTranskun(buffer, {
          baseUrl: PIANO_MODEL_URL,
          signal: controller.signal,
          onStage: (st) => {
            if (st.stage === 'downloading')
              show(
                'descargando',
                st.total ? st.loaded / st.total : null,
                `Descargando el modelo de piano (${mb(st.total || 58e6)} MB, solo la primera vez)`,
              );
            else if (st.stage === 'preparing') show('preparando', null);
            else show('escuchando', st.progress);
          },
        });
        take = takeFromTranskun(result, name, buffer.duration);
      } else {
        const cuerdas = instrumento !== 'piano';
        const raw = await transcribe(fuente, {
          signal: controller.signal,
          // Pedido 55: guitarra y bajo bajitos (micrófono): subir el volumen y umbrales de Spotify.
          ...(cuerdas ? { params: PARAMS_CUERDAS, normalizar: true } : {}),
          onStage: (stage) =>
            stage === 'preparing'
              ? show('preparando', null, 'Solo la primera vez; puede tardar hasta medio minuto')
              : show('escuchando', 0),
          onProgress: (progress) => show('escuchando', progress),
        });
        // Guitarra y bajo: las notas de la IA con cuerda y traste.
        take = conInstrumento(takeFromTranscription(raw, name, buffer.duration), instrumento);
      }
      if (take.tracks[0]!.notes.length === 0) {
        fallo(
          name,
          `Se oyó sonido, pero no encontramos notas de ${NOMBRE_INSTRUMENTO[instrumento] ?? 'piano'}. Prueba con el micrófono más cerca del instrumento o con menos ruido alrededor.`,
        );
        return;
      }
      show('armando', 1);
      // Se guarda con su audio (las notas salieron de él: desfase 0) en "Tus grabaciones".
      const ext = blob.type.includes('webm') ? 'webm' : blob.type.includes('ogg') ? 'ogg' : 'audio';
      const key = `${take.id}.${ext}`;
      await saveMedia(blob, key);
      take.media.push({ kind: 'audio', storageKey: key, offset: 0 });
      await saveTake(take);
      await refreshTakes();
      // Se abre si no se está grabando otra cosa ni hay más en la cola (si no, queda en
      // "Tus grabaciones").
      if (get().state.step !== 'recording' && pendientes.length === 0)
        useStudio.getState().open(take);
    } catch (e) {
      if (!(e instanceof TranscriptionCancelled))
        fallo(name, 'No pudimos convertir ese audio. Prueba con MP3, WAV, M4A o FLAC.');
    } finally {
      abort = null;
      actual = null;
      avances.delete(id);
    }
  };

  return {
    state: { step: 'idle' },
    cola: [],
    model: PIANO_MODEL_URL ? 'piano' : 'rapido',
    setModel: (model) => set({ model }),
    separar: true,
    setSeparar: (separar) => set({ separar }),
    reset: () => set({ state: { step: 'idle' } }),
    cancel: (id) => {
      if (id === undefined || id === actual) {
        abort?.abort();
        return;
      }
      const i = pendientes.findIndex((p) => p.id === id);
      if (i >= 0) pendientes.splice(i, 1);
      quitar(id);
    },

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
        set({ state: { step: 'idle' } });
        encolar(new Blob(chunks, { type: rec.mimeType }), nextAudioName(), true);
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
      encolar(file, file.name.replace(/\.[^.]+$/, ''), false);
    },
  };
});

/** Stream del micrófono mientras se graba (para el medidor de nivel). */
export const micStream = () => stream;
