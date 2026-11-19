import { Button, Chips, Lcd, Switch } from '@impromptu/ui';
import { FileAudio, Mic, Square, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { fraseDeEspera, prepareTranscriber, textoRestante } from '@impromptu/transcribe';
import { onMenuAction } from '../desktop';
import { engine } from './audio';
import { useStudio } from './store';
import { PIANO_MODEL_URL, avanceVisible, micStream, useTranscribe } from './transcribeStore';
import type { Conversion } from './transcribeStore';
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
  const instrumento = useStudio((s) => s.instrumento);
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
        // Al acercarse al botón se va preparando la IA que escucha en vivo.
        onPointerEnter={prepareTranscriber}
        onFocus={prepareTranscriber}
        onClick={() => void startMic()}
      >
        Grabar con el micrófono
      </Button>
      {instrumento === 'drums' && (
        <p className="ui-secundario">
          Detecta bombo, caja, hi-hat, toms y platillos. Sale mejor con la batería sola.
        </p>
      )}
      {(instrumento === 'guitar' || instrumento === 'bass') && (
        <p className="ui-secundario">
          La IA escucha las notas y elige cuerda y traste por ti. Sale mejor con el instrumento
          solo.
        </p>
      )}
      {PIANO_MODEL_URL && instrumento === 'piano' && (
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
  // Se puede convertir otro mientras uno trabaja (cola); no mientras se graba.
  const busy = useTranscribe((s) => s.state.step === 'recording');
  // Pedido 35: con una canción completa, separar primero el instrumento (como Moises).
  const separar = useTranscribe((s) => s.separar);
  const instrumento = useStudio((s) => s.instrumento);
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
      {instrumento !== 'piano' && (
        <Switch
          label="Separar el instrumento de la canción"
          checked={separar}
          onChange={(v) => useTranscribe.getState().setSeparar(v)}
        />
      )}
    </>
  );
}

/** Una conversión de la cola: barra que se mueve todo el tiempo, frase y cuánto falta. */
function FilaConversion({ c, ahora }: { c: Conversion; ahora: number }) {
  if (c.inicio === null) {
    return (
      <div className={own.fila}>
        <p className="ui-secundario">
          <strong>{c.name}</strong> · espera su turno
        </p>
        <Button icon={<X />} onClick={() => useTranscribe.getState().cancel(c.id)}>
          Quitar
        </Button>
      </div>
    );
  }
  const { valor, restante } = avanceVisible(c, ahora);
  const falta = textoRestante(restante);
  return (
    <div className={own.conversion}>
      <div className={own.fila}>
        <p className="ui-secundario">
          <strong>{c.name}</strong>
        </p>
        {valor !== null && <Lcd size="sm">{Math.floor(valor * 100)} %</Lcd>}
        <Button icon={<X />} onClick={() => useTranscribe.getState().cancel(c.id)}>
          Cancelar
        </Button>
      </div>
      {valor === null ? (
        <div className={own.preparando} aria-hidden="true" />
      ) : (
        <div className={own.barra} aria-hidden="true">
          <div style={{ transform: `scaleX(${valor})` }} />
        </div>
      )}
      <p className="ui-secundario" role="status">
        {c.detalle ?? fraseDeEspera(c.etapa, ahora - c.inicio)}
        {falta && ` · ${falta}`}
      </p>
    </div>
  );
}

/**
 * Aviso fijo arriba del panel con la cola de conversiones (se puede seguir grabando mientras
 * trabajan), o si algo falló.
 */
export function TranscribeStatus() {
  const state = useTranscribe((s) => s.state);
  const cola = useTranscribe((s) => s.cola);
  const { reset } = useTranscribe.getState();
  const [ahora, setAhora] = useState(() => performance.now());
  useEffect(() => {
    if (cola.length === 0) return;
    let raf = 0;
    const tic = () => {
      setAhora(performance.now());
      raf = requestAnimationFrame(tic);
    };
    raf = requestAnimationFrame(tic);
    return () => cancelAnimationFrame(raf);
  }, [cola.length]);
  return (
    <>
      {cola.length > 0 && (
        <div className={own.aviso}>
          {cola.map((c) => (
            <FilaConversion key={c.id} c={c} ahora={ahora} />
          ))}
        </div>
      )}
      <EstadoMic state={state} reset={reset} />
    </>
  );
}

function EstadoMic({
  state,
  reset,
}: {
  state: ReturnType<typeof useTranscribe.getState>['state'];
  reset: () => void;
}) {
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
