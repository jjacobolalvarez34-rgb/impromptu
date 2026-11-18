import { Button, IconButton, Lcd, Logo } from '@impromptu/ui';
import {
  ChevronLeft,
  Download,
  FileMusic,
  Pause,
  Play,
  Repeat,
  RotateCw,
  SkipBack,
  SlidersHorizontal,
  Square,
} from 'lucide-react';
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { lockOrientation } from '../native/orientation';
import { ExportDialog } from '../studio/ExportDialog';
import { KeyboardSection } from '../studio/LivePanel';
import { SettingsPanel } from '../studio/SettingsPanel';
import { ConvertAudioButton, MicSection, TranscribeStatus } from '../studio/TranscribeSection';
import { TutorialPanel } from '../studio/TutorialPanel';
import { VisualizerView } from '../studio/VisualizerView';
import { engine } from '../studio/audio';
import { live, refreshTakes, useLive } from '../studio/live';
import { practice } from '../studio/practice';
import { openMidiFile } from '../studio/sources';
import { transport, useStudio } from '../studio/store';
import { loadTake } from '../studio/takesDb';
import type { TakeSummary } from '../studio/takesDb';
import { useTranscribe } from '../studio/transcribeStore';
import { formatTime } from '../studio/transport';
import styles from './Celular.module.css';

const ScoreTab = lazy(() => import('../score/ScoreTab').then((m) => ({ default: m.ScoreTab })));

type Screen = 'inicio' | 'pieza' | 'grabando' | 'ajustes';
type Mode = 'ver' | 'partitura' | 'practicar';

const MODES: { id: Mode; label: string }[] = [
  { id: 'ver', label: 'Ver' },
  { id: 'partitura', label: 'Partitura' },
  { id: 'practicar', label: 'Practicar' },
];
const SPEEDS = [0.5, 0.75, 1, 1.25];

/**
 * Celular, "Piezas primero" (DESIGN §5, elegida por Jacobo): el inicio en vertical con Grabar,
 * Abrir MIDI, De MP3 a MIDI y las piezas; al abrir una pieza o grabar, la pantalla gira a
 * horizontal (el piano y la partitura nunca en vertical).
 */
export function Celular() {
  const [screen, setScreen] = useState<Screen>('inicio');
  const opened = useStudio((s) => s.take?.id);
  const firstOpen = useRef(opened);

  useEffect(() => {
    void engine.preload();
    void live.autoConnect();
    void refreshTakes();
  }, []);

  // Se abrió una pieza (de la lista, de un MIDI, de una grabación o de un audio): a la pieza.
  useEffect(() => {
    if (opened && opened !== firstOpen.current) setScreen('pieza');
    firstOpen.current = opened;
  }, [opened]);

  useEffect(() => {
    void lockOrientation(screen === 'pieza' || screen === 'grabando' ? 'landscape' : 'portrait');
  }, [screen]);

  if (screen === 'pieza') return <Pieza onBack={() => setScreen('inicio')} />;
  if (screen === 'grabando') return <Grabando onDone={() => setScreen('inicio')} />;
  if (screen === 'ajustes') return <Ajustes onBack={() => setScreen('inicio')} />;
  return <Inicio onRecord={() => setScreen('grabando')} onSettings={() => setScreen('ajustes')} />;
}

function Inicio({ onRecord, onSettings }: { onRecord: () => void; onSettings: () => void }) {
  const device = useLive((s) => s.device);
  const takes = useLive((s) => s.takes);
  const busy = useTranscribe((s) => s.state.step === 'recording');
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const record = () => {
    void engine.start();
    if (device) live.startRecording();
    else void useTranscribe.getState().startMic();
    onRecord();
  };

  const openTake = async (t: TakeSummary) => {
    const take = await loadTake(t.id);
    if (take) useStudio.getState().open(take);
  };

  return (
    <div className={styles.inicio}>
      <header className={styles.cabecera}>
        <Logo size={20} keyboard={false} />
        <IconButton label="Ajustes" icon={<SlidersHorizontal />} onClick={onSettings} />
      </header>
      <TranscribeStatus />
      <button type="button" className={styles.grabar} onClick={record} disabled={busy}>
        <span className={styles.punto} aria-hidden="true" />
        <span>Grabar</span>
        <span className={styles.fuente}>
          {device
            ? `Teclado · ${device.profile.id === 'generic' ? device.name : device.profile.label}`
            : 'Micrófono'}
        </span>
      </button>
      <div className={styles.dos}>
        <input
          ref={fileInput}
          type="file"
          accept=".mid,.midi,audio/midi"
          className="ui-oculto"
          aria-label="Archivo MIDI para abrir"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (!file) return;
            openMidiFile(file)
              .then(({ take, notices }) => {
                useStudio.getState().open(take, notices);
                setError(null);
              })
              .catch(() => setError('No pudimos leer ese archivo. Revisa que sea un MIDI (.mid).'));
          }}
        />
        <Button icon={<FileMusic />} onClick={() => fileInput.current?.click()}>
          Abrir MIDI
        </Button>
        <ConvertAudioButton label="De MP3 a MIDI" />
      </div>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <h2 className="ui-etiqueta">Tus piezas</h2>
      {takes.length === 0 ? (
        <p className="ui-secundario">
          Graba con el teclado o el micrófono, abre un MIDI o convierte un audio: aquí quedan tus
          piezas, guardadas en el celular.
        </p>
      ) : (
        <ul className={styles.piezas}>
          {takes.map((t) => (
            <li key={t.id}>
              <button type="button" className={styles.tarjeta} onClick={() => void openTake(t)}>
                <Miniatura seed={t.id} />
                <span className={styles.nombre}>{t.title}</span>
                <span className="ui-mono ui-secundario">
                  {formatTime(t.duration).slice(0, 5)} · {SOURCE[t.source]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const SOURCE = { teclado: 'teclado', microfono: 'micrófono', archivo: 'audio' } as const;

/** Miniatura decorativa: unas notas cayendo, distintas para cada pieza. */
function Miniatura({ seed }: { seed: string }) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const bars = Array.from({ length: 5 }, (_, i) => {
    const r = (h >> (i * 5)) & 31;
    return {
      left: `${8 + i * 18 + (r % 6)}%`,
      top: `${8 + (r % 16) * 3}%`,
      height: `${22 + (r % 4) * 12}%`,
      clara: i % 2 === 1,
    };
  });
  return (
    <span className={styles.miniatura} aria-hidden="true">
      {bars.map((b, i) => (
        <span
          key={i}
          data-clara={b.clara}
          style={{ left: b.left, top: b.top, height: b.height } as CSSProperties}
        />
      ))}
    </span>
  );
}

/** Pieza abierta, en horizontal: Ver, Partitura o Practicar, y el transporte abajo. */
function Pieza({ onBack }: { onBack: () => void }) {
  const take = useStudio((s) => s.take);
  const playing = useStudio((s) => s.playing);
  const loopOn = useStudio((s) => s.loopOn);
  const speed = useStudio((s) => s.speed);
  const [mode, setMode] = useState<Mode>('ver');
  const [exportOpen, setExportOpen] = useState(false);
  const timeRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    useStudio.getState().setView('take');
    practice.setActive(mode === 'practicar');
    return () => practice.setActive(false);
  }, [mode]);

  const onFrame = useCallback((t: number) => {
    const duration = useStudio.getState().take?.duration ?? 0;
    if (timeRef.current) timeRef.current.textContent = formatTime(t).slice(0, 5);
    if (barRef.current) barRef.current.style.width = `${duration > 0 ? (t / duration) * 100 : 0}%`;
    if (!transport.playing && useStudio.getState().playing) useStudio.setState({ playing: false });
  }, []);

  if (!take) return null;
  return (
    <div className={styles.horizontal}>
      <Girar />
      <header className={styles.barraPieza}>
        <IconButton label="Volver a tus piezas" icon={<ChevronLeft />} onClick={onBack} />
        <div className={styles.titulo}>
          <span>{take.title}</span>
          <span className="ui-mono ui-secundario">
            {formatTime(take.duration).slice(0, 5)} ·{' '}
            {take.tracks.reduce((n, t) => n + t.notes.length, 0)} notas
          </span>
        </div>
        <nav className={styles.modos} aria-label="Modo">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={styles.modo}
              aria-current={mode === m.id ? 'page' : undefined}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </nav>
        <Button icon={<Download />} onClick={() => setExportOpen(true)}>
          Exportar
        </Button>
      </header>
      <main className={styles.lienzo}>
        {mode === 'partitura' ? (
          <Suspense fallback={<p className="ui-secundario">Cargando la partitura…</p>}>
            <ScoreTab compact />
          </Suspense>
        ) : (
          <>
            <div className={styles.visual}>
              <VisualizerView onFrame={onFrame} fill />
            </div>
            {mode === 'practicar' && (
              <aside className={styles.practica} aria-label="Tutorial">
                <TutorialPanel />
              </aside>
            )}
          </>
        )}
      </main>
      <footer className={styles.transporte}>
        <IconButton label="Al inicio" icon={<SkipBack />} onClick={() => transport.seek(0)} />
        <Button
          variant="primary"
          aria-label={playing ? 'Pausar' : 'Reproducir'}
          icon={playing ? <Pause /> : <Play />}
          onClick={() => {
            void engine.start();
            useStudio.getState().togglePlay();
          }}
        />
        <Lcd size="md">
          <span ref={timeRef}>00:00</span>
        </Lcd>
        <span
          className={styles.progreso}
          role="slider"
          tabIndex={0}
          aria-label="Ir a un momento de la pieza"
          aria-valuemin={0}
          aria-valuemax={Math.round(take.duration)}
          aria-valuenow={0}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            transport.seek(((e.clientX - r.left) / r.width) * take.duration);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') transport.seek(transport.now() + 5);
            if (e.key === 'ArrowLeft') transport.seek(transport.now() - 5);
          }}
        >
          <span ref={barRef} />
        </span>
        <IconButton
          label={loopOn ? 'Quitar la repetición' : 'Repetir la sección marcada'}
          icon={<Repeat />}
          aria-pressed={loopOn}
          onClick={() => useStudio.getState().toggleLoop()}
        />
        <Button
          aria-label={`Velocidad ${speed}×`}
          onClick={() =>
            useStudio.getState().setSpeed(SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length] ?? 1)
          }
        >
          {String(speed).replace('.', ',')}×
        </Button>
      </footer>
      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}

/** Grabando, en horizontal: el piano en vivo y, al costado, el tiempo y Detener. */
function Grabando({ onDone }: { onDone: () => void }) {
  const recordingKeys = useLive((s) => s.recording);
  const micState = useTranscribe((s) => s.state.step);
  const sustain = useLive((s) => s.sustain);
  const timeRef = useRef<HTMLSpanElement>(null);
  const started = useRef(0);

  useEffect(() => {
    useStudio.getState().setView('live');
    if (started.current === 0) started.current = performance.now();
    let raf = 0;
    const loop = () => {
      const t = recordingKeys ? live.elapsed() : (performance.now() - started.current) / 1000;
      if (timeRef.current) timeRef.current.textContent = formatTime(t).slice(0, 5);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [recordingKeys]);

  // Con el micrófono, al detener la grabación va a la cola de conversiones y se vuelve al
  // inicio: se puede grabar otra mientras la IA trabaja (pedido de Jacobo, 2026-11-18).
  const vioGrabar = useRef(false);
  useEffect(() => {
    if (micState === 'recording') vioGrabar.current = true;
    else if (!recordingKeys && (vioGrabar.current || micState === 'error')) onDone();
  }, [recordingKeys, micState, onDone]);

  const stop = async () => {
    if (recordingKeys) {
      const take = await live.stopRecording();
      if (take) useStudio.getState().open(take);
      else onDone();
    } else {
      useTranscribe.getState().stopMic();
    }
  };

  return (
    <div className={styles.horizontal}>
      <Girar />
      <div className={styles.grabando}>
        <div className={styles.visual}>
          <VisualizerView fill />
        </div>
        <aside className={styles.lateral} aria-label="Grabación">
          <span className={styles.estado}>
            <span className={styles.punto} aria-hidden="true" />
            Grabando
          </span>
          <Lcd size="lg">
            <span ref={timeRef}>00:00</span>
          </Lcd>
          <button
            type="button"
            className={styles.detener}
            aria-label="Detener la grabación"
            onClick={() => void stop()}
          >
            <Square aria-hidden="true" />
          </button>
          {recordingKeys && (
            <span className={styles.pedal} data-pisado={sustain >= 64}>
              <span aria-hidden="true">
                <span style={{ width: `${(sustain / 127) * 100}%` }} />
              </span>
              Ped.
            </span>
          )}
        </aside>
      </div>
    </div>
  );
}

function Ajustes({ onBack }: { onBack: () => void }) {
  return (
    <div className={styles.ajustes}>
      <header className={styles.cabecera}>
        <IconButton label="Volver" icon={<ChevronLeft />} onClick={onBack} />
        <h1 className="ui-titulo-pantalla">Ajustes</h1>
      </header>
      <h2 className="ui-etiqueta">Teclado</h2>
      <KeyboardSection />
      <h2 className="ui-etiqueta">Micrófono</h2>
      <MicSection />
      <SettingsPanel />
      <a className={styles.acerca} href="/acerca">
        Acerca de Impromptu · Un producto de Mamut Herd
      </a>
    </div>
  );
}

/** En vertical, pide girar el celular: el piano y la partitura van en horizontal. */
function Girar() {
  return (
    <div className={styles.girar} role="status">
      <RotateCw aria-hidden="true" />
      <p>Gira el celular para ver el piano.</p>
    </div>
  );
}
