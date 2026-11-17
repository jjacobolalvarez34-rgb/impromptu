import { Button, Chips, Lcd } from '@impromptu/ui';
import { FileAudio, Mic, Square, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { prepareTranscriber } from '@impromptu/transcribe';
import { onMenuAction } from '../desktop';
import { engine } from './audio';
import { PIANO_MODEL_URL, micStream, useTranscribe } from './transcribeStore';
import styles from './LivePanel.module.css';
import own from './TranscribeSection.module.css';

const MODELS = [
  { value: 'piano', label: 'Piano con pedal' },
  { value: 'rapido', label: 'Rápido' },
] as const;

/** Grabar con el micrófono: botón, modelo de IA y, mientras graba, medidor de nivel. */
export function MicSection() {
  const state = useTranscribe((s) => s.state);
  const model = useTranscribe((s) => s.model);
  const { setModel, startMic, stopMic } = useTranscribe.getState();

  if (state.step === 'recording') {
    return (
      <div className={styles.seccion}>
        <p className="ui-secundario" role="status">
          Grabando. Las notas aparecen al tocar, con un segundo de retraso. Al terminar, aprieta
          Detener y la IA repasa todo para dejarlo preciso.
        </p>
        <p className={own.mic} title={state.device}>
          {state.device}
        </p>
        <LevelMeter />
        <Button variant="stop" icon={<Square />} onClick={stopMic}>
          Detener
        </Button>
      </div>
    );
  }
  return (
    <div className={styles.seccion}>
      <Button
        icon={<Mic />}
        disabled={state.step === 'working'}
        // Al acercarse al botón se va preparando la IA que escucha en vivo.
        onPointerEnter={prepareTranscriber}
        onFocus={prepareTranscriber}
        onClick={() => void startMic()}
      >
        Grabar con el micrófono
      </Button>
      {PIANO_MODEL_URL && (
        <>
          <Chips label="Modelo de IA" options={MODELS} value={model} onChange={setModel} />
          <p className="ui-secundario">
            {model === 'piano'
              ? 'Piano con pedal: más preciso, ignora voces y ruido, y saca el pedal. Más lento.'
              : 'Rápido: cualquier instrumento, menos preciso en piano y sin pedal.'}
          </p>
        </>
      )}
    </div>
  );
}

/** Medidor de nivel en vivo, para ver que el micrófono sí está captando. */
function LevelMeter() {
  const level = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const stream = micStream();
    if (!stream) return;
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
    return () => {
      cancelAnimationFrame(frame);
      source.disconnect();
    };
  }, []);
  return (
    <div className={own.medidor} aria-hidden="true">
      <div ref={level} className={own.nivel} style={{ transform: 'scaleX(0)' }} />
    </div>
  );
}

/** Botón "Convertir un audio" (archivo a notas). */
export function ConvertAudioButton({ label = 'Convertir un audio' }: { label?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const busy = useTranscribe((s) => s.state.step === 'working' || s.state.step === 'recording');
  // Menú de la app de escritorio: Archivo › Convertir un audio.
  useEffect(() => onMenuAction((a) => a === 'convertir-audio' && input.current?.click()), []);
  return (
    <>
      <input
        ref={input}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.flac,.ogg"
        className="ui-oculto"
        aria-label="Archivo de audio para convertir en notas"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) useTranscribe.getState().convert(file);
        }}
      />
      <Button icon={<FileAudio />} disabled={busy} onClick={() => input.current?.click()}>
        {label}
      </Button>
    </>
  );
}

/** Aviso fijo arriba del panel mientras la IA trabaja, o si algo falló. */
export function TranscribeStatus() {
  const state = useTranscribe((s) => s.state);
  const { cancel, reset } = useTranscribe.getState();
  if (state.step === 'working') {
    return (
      <div className={own.aviso}>
        <p className="ui-secundario" role="status">
          {state.label}
        </p>
        <div className={styles.toma}>
          {state.progress === null ? (
            <div className={own.preparando} style={{ flex: 1 }} aria-hidden="true" />
          ) : (
            <Lcd size="md">{Math.round(state.progress * 100)} %</Lcd>
          )}
          <Button icon={<X />} onClick={cancel}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }
  if (state.step === 'error') {
    return (
      <div className={own.aviso}>
        <p role="alert" className={styles.alerta}>
          {state.message}
        </p>
        <Button onClick={reset}>Entendido</Button>
      </div>
    );
  }
  return null;
}
