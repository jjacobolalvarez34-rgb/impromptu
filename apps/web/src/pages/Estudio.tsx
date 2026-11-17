import { Button, Chips, DeviceIndicator, IconButton, Lcd, Logo, Tabs } from '@impromptu/ui';
import {
  FileMusic,
  Film,
  Gauge,
  Pause,
  Play,
  Repeat,
  SkipBack,
  Square,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { DragEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { VisualizerView } from '../studio/VisualizerView';
import { LOCAL_PIECES, createDemoTake, openLocalPiece, openMidiFile } from '../studio/sources';
import type { OpenedTake } from '../studio/sources';
import { engine, useAudio } from '../studio/audio';
import { live, useLive } from '../studio/live';
import { ExportDialog } from '../studio/ExportDialog';
import { KeyboardSection, TakesSection } from '../studio/LivePanel';
import { SettingsPanel } from '../studio/SettingsPanel';
import { Timeline } from '../studio/Timeline';
import { transport, useStudio } from '../studio/store';
import type { Aspect } from '../studio/store';
import { formatTime } from '../studio/transport';
import styles from './Estudio.module.css';

const ASPECTS = [
  { value: '16:9', label: 'Horizontal 16:9' },
  { value: '9:16', label: 'Vertical 9:16' },
  { value: '1:1', label: 'Cuadrado 1:1' },
] as const;

const SPEEDS = [
  { value: '0.5', label: '0,5×' },
  { value: '0.75', label: '0,75×' },
  { value: '1', label: '1×' },
  { value: '1.25', label: '1,25×' },
  { value: '1.5', label: '1,5×' },
] as const;

const TABS = [
  { id: 'estudio', label: 'Estudio' },
  { id: 'tutorial', label: 'Tutorial' },
  { id: 'partitura', label: 'Partitura' },
  { id: 'en-vivo', label: 'En vivo' },
] as const;

export function Estudio() {
  const take = useStudio((s) => s.take);
  const notices = useStudio((s) => s.notices);
  const aspect = useStudio((s) => s.aspect);
  const playing = useStudio((s) => s.playing);
  const view = useStudio((s) => s.view);
  const loop = useStudio((s) => s.loop);
  const loopOn = useStudio((s) => s.loopOn);
  const speed = useStudio((s) => s.speed);
  const {
    open,
    setAspect,
    setView,
    toggleLoop,
    togglePlay: toggle,
    setSpeed,
  } = useStudio.getState();
  const audioStatus = useAudio((s) => s.status);
  const audioProgress = useAudio((s) => s.progress);
  const audioEnabled = useAudio((s) => s.enabled);

  const device = useLive((s) => s.device);
  const recording = useLive((s) => s.recording);
  const startRecording = () => {
    transport.pause();
    useStudio.setState({ playing: false });
    live.startRecording();
  };
  const stopRecording = async () => {
    const take = await live.stopRecording();
    if (take) open(take);
  };

  // El primer "Reproducir" es el gesto que permite crear el audio (BUGS B-008).
  const togglePlay = () => {
    void engine.start();
    toggle();
  };
  useEffect(() => engine.setTake(take), [take]);

  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const load = async (promise: Promise<OpenedTake>) => {
    try {
      const { take, notices } = await promise;
      open(take, notices);
      setError(null);
    } catch {
      setError('No pudimos leer ese archivo. Revisa que sea un MIDI (.mid) y vuelve a intentar.');
    }
  };

  // Barra espaciadora: reproducir o pausar (si no se está escribiendo en un campo).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        e.code !== 'Space' ||
        target.closest('input, textarea, button, [role="radio"], [role="tab"]')
      )
        return;
      e.preventDefault();
      void engine.start();
      useStudio.getState().togglePlay();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onFrame = useCallback((t: number) => {
    // Grabando, el LCD muestra el tiempo de la toma nueva.
    const shown = useLive.getState().recording ? live.elapsed() : t;
    if (timeRef.current) timeRef.current.textContent = formatTime(shown);
    const duration = useStudio.getState().take?.duration ?? 0;
    if (playheadRef.current) {
      playheadRef.current.style.left = `${duration > 0 ? (t / duration) * 100 : 0}%`;
    }
    // El transporte se detiene solo al final: refleja el estado en el botón.
    if (!transport.playing && useStudio.getState().playing) useStudio.setState({ playing: false });
  }, []);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void load(openMidiFile(file));
  };

  const noteCount = take?.tracks.reduce((n, t) => n + t.notes.length, 0) ?? 0;

  return (
    <div
      className={styles.estudio}
      data-arrastrando={dragging}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <header className={styles.barra}>
        <Logo size={18} keyboard={false} />
        <div className={styles.toma}>
          <strong>{take?.title ?? 'Sin pieza abierta'}</strong>
          <span className="ui-secundario">
            {take
              ? `${noteCount.toLocaleString('es')} notas · ${formatTime(take.duration)}`
              : 'Abre un MIDI para empezar'}
          </span>
        </div>
        <Tabs
          label="Secciones"
          idPrefix="app"
          tabs={TABS}
          value="estudio"
          onChange={(id) => {
            if (id === 'en-vivo') void navigate('/en-vivo');
          }}
        />
        <div className={styles.acciones}>
          {device && (
            <button
              type="button"
              className={styles.dispositivo}
              aria-pressed={view === 'live'}
              title="Ver el teclado en vivo"
              onClick={() => setView('live')}
            >
              <DeviceIndicator
                name={device.profile.id === 'generic' ? device.name : device.profile.label}
                connected
              />
            </button>
          )}
          <Button icon={<Film />} disabled={!take} onClick={() => setExportOpen(true)}>
            Exportar video
          </Button>
          <Button
            variant={device ? 'secondary' : 'primary'}
            icon={<FileMusic />}
            onClick={() => fileInput.current?.click()}
          >
            Abrir MIDI
          </Button>
          {device &&
            (recording ? (
              <Button variant="stop" icon={<Square />} onClick={() => void stopRecording()}>
                Detener
              </Button>
            ) : (
              <Button variant="primary" rec onClick={startRecording}>
                Grabar
              </Button>
            ))}
        </div>
      </header>

      <div
        className={styles.cuerpo}
        role="tabpanel"
        id="app-panel-estudio"
        aria-labelledby="app-tab-estudio"
      >
        <aside className={styles.panel} aria-label="Fuentes y tomas">
          <KeyboardSection />
          <TakesSection />
          <h2 className="ui-etiqueta">Archivos MIDI</h2>
          <input
            ref={fileInput}
            type="file"
            accept=".mid,.midi,audio/midi"
            className="ui-oculto"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void load(openMidiFile(file));
              e.target.value = '';
            }}
          />
          <p className="ui-secundario">
            Arrastra un archivo .mid a cualquier parte de la pantalla.
          </p>

          {LOCAL_PIECES.length > 0 && (
            <>
              <h3 className="ui-etiqueta">Tus piezas</h3>
              <ul className={styles.lista}>
                {LOCAL_PIECES.map((p) => (
                  <li key={p.path}>
                    <button
                      type="button"
                      className={styles.fila}
                      aria-current={take?.title.toLowerCase() === p.name.toLowerCase()}
                      onClick={() => void load(openLocalPiece(p.path))}
                    >
                      {p.name}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          <h3 className="ui-etiqueta">Pruebas</h3>
          <ul className={styles.lista}>
            <li>
              <button
                type="button"
                className={styles.fila}
                onClick={() => open(createDemoTake(), [])}
              >
                <Gauge aria-hidden="true" /> 2.000 notas en pantalla
              </button>
            </li>
          </ul>

          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
          {notices.length > 0 && (
            <ul className={styles.avisos} aria-label="Avisos del archivo">
              {notices.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          )}
        </aside>

        <main className={styles.centro}>
          <Chips
            label="Formato"
            options={ASPECTS}
            value={aspect}
            onChange={(v) => setAspect(v as Aspect)}
          />
          <div className={styles.lienzo}>
            <VisualizerView
              onFrame={onFrame}
              showFps={params.has('fps') || take?.title.startsWith('Prueba') === true}
            />
            {!take && (
              <div className={styles.vacio}>
                <p>Abre un MIDI o arrástralo aquí para verlo caer.</p>
              </div>
            )}
          </div>
        </main>

        <aside className={styles.panel} aria-label="Ajustes del visualizador">
          <SettingsPanel />
        </aside>
      </div>

      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
      <Timeline playheadRef={playheadRef} />
      <footer className={styles.transporte}>
        <IconButton
          label="Ir al inicio"
          icon={<SkipBack />}
          disabled={!take}
          onClick={() => transport.seek(transport.loop?.start ?? 0)}
        />
        <IconButton
          label={playing ? 'Pausar' : 'Reproducir'}
          icon={playing ? <Pause /> : <Play />}
          disabled={!take}
          onClick={togglePlay}
        />
        <IconButton
          label={audioEnabled ? 'Silenciar el piano de la app' : 'Activar el piano de la app'}
          icon={audioEnabled ? <Volume2 /> : <VolumeX />}
          aria-pressed={!audioEnabled}
          onClick={() => useAudio.getState().setEnabled(!audioEnabled)}
        />
        <Lcd size="md" aria-label="Tiempo">
          <span ref={timeRef}>00:00.00</span>
          <span className={styles.duracion}>/ {formatTime(take?.duration ?? 0)}</span>
        </Lcd>
        <IconButton
          label={loopOn ? 'Dejar de repetir la sección' : 'Repetir la sección marcada'}
          title="Arrastra sobre la línea de tiempo para marcar una sección"
          icon={<Repeat />}
          aria-pressed={loopOn}
          disabled={!loop}
          onClick={toggleLoop}
        />
        <span className={styles.espacio} />
        {audioStatus === 'loading' && (
          <Lcd size="sm" aria-live="polite">
            Descargando piano {Math.round(audioProgress * 100)} %
          </Lcd>
        )}
        {audioStatus === 'error' && (
          <p role="alert" className={styles.alertaAudio}>
            No pudimos descargar el piano. Revisa tu conexión y vuelve a reproducir.
          </p>
        )}

        <div className={styles.velocidad}>
          <span className="ui-etiqueta">Velocidad</span>
          <Chips
            label="Velocidad de reproducción"
            options={SPEEDS}
            value={String(speed) as (typeof SPEEDS)[number]['value']}
            onChange={(v) => setSpeed(Number(v))}
          />
        </div>
      </footer>
    </div>
  );
}
