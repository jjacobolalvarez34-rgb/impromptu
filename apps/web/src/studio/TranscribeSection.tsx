import {
  TranscriptionCancelled,
  peakLevel,
  prepareTranscriber,
  takeFromTranscription,
  transcribe,
} from '@impromptu/transcribe';
import type { TranscribeStage } from '@impromptu/transcribe';
import { Button, Lcd } from '@impromptu/ui';
import { FileAudio, Mic, Square, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { engine } from './audio';
import { analyzeAudio, useOwnAudio } from './ownAudio';
import { useStudio } from './store';
import styles from './LivePanel.module.css';
import own from './TranscribeSection.module.css';

type State =
  | { step: 'idle' }
  | { step: 'recording'; device: string }
  | { step: 'working'; stage: TranscribeStage; progress: number; name: string }
  | { step: 'error'; message: string };

/** Por debajo de esto (unos −50 dB) el audio se considera silencio. */
const SILENCE = 0.003;

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
  const level = useRef<HTMLDivElement>(null);
  const stopMeter = useRef<(() => void) | null>(null);

  useEffect(() => () => stopMeter.current?.(), []);

  const run = async (blob: Blob, name: string, fromMic: boolean) => {
    const controller = new AbortController();
    abort.current = controller;
    setState({ step: 'working', stage: 'listening', progress: 0, name });
    try {
      const context = engine.audioContext;
      const buffer = await context.decodeAudioData(await blob.arrayBuffer());
      if (peakLevel(buffer) < SILENCE) {
        setState({
          step: 'error',
          message: fromMic
            ? 'No llegó sonido del micrófono. Revisa en el candado de la barra de direcciones cuál micrófono usa el navegador, o acerca el celular o el portátil al piano.'
            : 'Ese audio está en silencio.',
        });
        return;
      }
      const raw = await transcribe(buffer, {
        signal: controller.signal,
        onStage: (stage) => setState((s) => (s.step === 'working' ? { ...s, stage } : s)),
        onProgress: (progress) =>
          setState((s) => (s.step === 'working' ? { ...s, stage: 'listening', progress } : s)),
      });
      const take = takeFromTranscription(raw, name, buffer.duration);
      if (take.tracks[0]!.notes.length === 0) {
        setState({
          step: 'error',
          message:
            'Se oyó sonido, pero no encontramos notas de piano. Prueba con el micrófono más cerca del piano o con menos ruido alrededor.',
        });
        return;
      }
      useStudio.getState().open(take);
      // El audio original suena con las notas (desfase 0: las notas salieron de él).
      const ownAudio = await analyzeAudio(new File([blob], name), context, take.tracks[0]!.notes);
      useOwnAudio
        .getState()
        .set({ ...ownAudio, autoOffset: 0, confidence: 2, agree: true, use: true });
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

  /** Medidor de nivel en vivo, para ver que el micrófono sí está captando. */
  const startMeter = (stream: MediaStream) => {
    const context = engine.audioContext;
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    source.connect(analyser);
    const data = new Float32Array(analyser.fftSize);
    let frame = 0;
    const tick = () => {
      analyser.getFloatTimeDomainData(data);
      let peak = 0;
      for (const v of data) peak = Math.max(peak, Math.abs(v));
      // Escala en dB de −60 a 0 para que un micrófono bajo también se vea moverse.
      const db = 20 * Math.log10(Math.max(peak, 1e-4));
      const fill = Math.min(1, Math.max(0, (db + 60) / 60));
      if (level.current) level.current.style.transform = `scaleX(${fill})`;
      frame = requestAnimationFrame(tick);
    };
    tick();
    stopMeter.current = () => {
      cancelAnimationFrame(frame);
      source.disconnect();
      stopMeter.current = null;
    };
  };

  const startMic = async () => {
    void engine.start();
    // La IA se prepara mientras se graba: al detener, empieza a escuchar de inmediato.
    prepareTranscriber();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      const chunks: Blob[] = [];
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
      rec.onstop = () => {
        stopMeter.current?.();
        for (const t of stream.getTracks()) t.stop();
        void run(new Blob(chunks, { type: rec.mimeType }), 'Micrófono', true);
      };
      rec.start(1000);
      recorder.current = rec;
      setState({ step: 'recording', device: stream.getAudioTracks()[0]?.label || 'Micrófono' });
      startMeter(stream);
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
          if (file) void run(file, file.name.replace(/\.[^.]+$/, ''), false);
        }}
      />
      {state.step === 'idle' && (
        <>
          <p className="ui-secundario">
            Sin MIDI también: la IA escucha tu grabación y saca las notas, en tu equipo.
          </p>
          <Button
            icon={<FileAudio />}
            onClick={() => {
              prepareTranscriber();
              input.current?.click();
            }}
          >
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
            Grabando. Toca y aprieta Detener al terminar.
          </p>
          <p className={own.mic} title={state.device}>
            {state.device}
          </p>
          <div className={own.medidor} aria-hidden="true">
            <div ref={level} className={own.nivel} style={{ transform: 'scaleX(0)' }} />
          </div>
          <Button variant="stop" icon={<Square />} onClick={() => recorder.current?.stop()}>
            Detener
          </Button>
        </>
      )}
      {state.step === 'working' && (
        <>
          <p className="ui-secundario" role="status">
            {state.stage === 'preparing'
              ? 'Preparando la IA. Solo la primera vez; puede tardar hasta medio minuto.'
              : `Escuchando «${state.name}»…`}
          </p>
          <div className={styles.toma}>
            {state.stage === 'preparing' ? (
              <div className={own.preparando} style={{ flex: 1 }} aria-hidden="true" />
            ) : (
              <Lcd size="md">{Math.round(state.progress * 100)} %</Lcd>
            )}
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
