import { TranscriptionCancelled, takeFromTranscription, transcribe } from '@impromptu/transcribe';
import { Button, Lcd } from '@impromptu/ui';
import { FileAudio, Mic, Square, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { engine } from './audio';
import { analyzeAudio, useOwnAudio } from './ownAudio';
import { useStudio } from './store';
import styles from './LivePanel.module.css';

type State =
  | { step: 'idle' }
  | { step: 'recording'; started: number }
  | { step: 'working'; progress: number; name: string }
  | { step: 'error'; message: string };

/**
 * Audio o micrófono a notas (fase 5). La IA (Basic Pitch) corre en un worker, en el equipo.
 * El resultado se abre como toma (origin 'audio') con manos y dedos sugeridos, y el audio
 * original queda como "mi audio", ya sincronizado.
 */
export function TranscribeSection() {
  const [state, setState] = useState<State>({ step: 'idle' });
  const input = useRef<HTMLInputElement>(null);
  const abort = useRef<AbortController | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);

  const run = async (blob: Blob, name: string) => {
    const controller = new AbortController();
    abort.current = controller;
    setState({ step: 'working', progress: 0, name });
    try {
      const context = engine.audioContext;
      const buffer = await context.decodeAudioData(await blob.arrayBuffer());
      const raw = await transcribe(buffer, {
        signal: controller.signal,
        onProgress: (progress) => setState({ step: 'working', progress, name }),
      });
      const take = takeFromTranscription(raw, name, buffer.duration);
      if (take.tracks[0]!.notes.length === 0) {
        setState({
          step: 'error',
          message:
            'No encontramos notas en ese audio. Prueba con una grabación más clara del piano.',
        });
        return;
      }
      useStudio.getState().open(take);
      // El audio original suena con las notas (desfase 0: las notas salieron de él).
      const own = await analyzeAudio(new File([blob], name), context, take.tracks[0]!.notes);
      useOwnAudio.getState().set({ ...own, autoOffset: 0, confidence: 2, agree: true, use: true });
      setState({ step: 'idle' });
    } catch (e) {
      if (e instanceof TranscriptionCancelled) setState({ step: 'idle' });
      else
        setState({
          step: 'error',
          message: 'No pudimos convertir ese audio. Prueba con MP3, WAV, M4A o FLAC.',
        });
    } finally {
      abort.current = null;
    }
  };

  const startMic = async () => {
    void engine.start();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      const chunks: Blob[] = [];
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
      rec.onstop = () => {
        for (const t of stream.getTracks()) t.stop();
        void run(new Blob(chunks, { type: rec.mimeType }), 'Micrófono');
      };
      rec.start(1000);
      recorder.current = rec;
      setState({ step: 'recording', started: performance.now() });
    } catch {
      setState({
        step: 'error',
        message:
          'No diste permiso para el micrófono. Actívalo en el candado de la barra de direcciones.',
      });
    }
  };

  return (
    <section className={styles.seccion} aria-labelledby="transcribir-titulo">
      <h2 id="transcribir-titulo" className="ui-etiqueta">
        Audio a notas
      </h2>
      <input
        ref={input}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.flac,.ogg"
        className="ui-oculto"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) void run(file, file.name.replace(/\.[^.]+$/, ''));
        }}
      />
      {state.step === 'idle' && (
        <>
          <p className="ui-secundario">
            Sin MIDI también: la IA escucha tu grabación y saca las notas, en tu equipo.
          </p>
          <Button icon={<FileAudio />} onClick={() => input.current?.click()}>
            Convertir un audio
          </Button>
          <Button icon={<Mic />} onClick={() => void startMic()}>
            Grabar con el micrófono
          </Button>
        </>
      )}
      {state.step === 'recording' && (
        <>
          <p className="ui-secundario" role="status">
            Grabando con el micrófono. Toca y aprieta Detener al terminar.
          </p>
          <Button variant="stop" icon={<Square />} onClick={() => recorder.current?.stop()}>
            Detener
          </Button>
        </>
      )}
      {state.step === 'working' && (
        <>
          <p className="ui-secundario" role="status">
            Escuchando «{state.name}»…
          </p>
          <div className={styles.toma}>
            <Lcd size="md">{Math.round(state.progress * 100)} %</Lcd>
            <Button icon={<X />} onClick={() => abort.current?.abort()}>
              Cancelar
            </Button>
          </div>
        </>
      )}
      {state.step === 'error' && (
        <>
          <p role="alert" className={styles.alerta}>
            {state.message}
          </p>
          <Button onClick={() => setState({ step: 'idle' })}>Volver</Button>
        </>
      )}
    </section>
  );
}
