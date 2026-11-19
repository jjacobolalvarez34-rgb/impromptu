import { Button, Chips, DeviceIndicator, IconButton, Lcd, Logo, Tabs } from '@impromptu/ui';
import {
  Download,
  FileMusic,
  Film,
  Gauge,
  Pause,
  Play,
  Redo2,
  Repeat,
  SkipBack,
  Square,
  Undo2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, DragEvent } from 'react';
import { beatAt, beatGrid, tempoAt } from '@impromptu/core';
import type { Instrument } from '@impromptu/core';
import { instrumentoDe } from '@impromptu/render';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { VisualizerView } from '../studio/VisualizerView';
import {
  LOCAL_PIECES,
  DEMO_PIECES,
  createDemoTake,
  instrumentoDePieza,
  openLocalPiece,
  openMidiFile,
} from '../studio/sources';
import type { OpenedTake } from '../studio/sources';
import { engine, useAudio } from '../studio/audio';
import { live, useLive } from '../studio/live';
import { AudioSection, openOwnAudio } from '../studio/AudioSection';
import { EditBar, useEditShortcuts } from '../studio/EditBar';
import { ExportDialog } from '../studio/ExportDialog';
import { ConvertAudioButton, MicSection, TranscribeStatus } from '../studio/TranscribeSection';
import {
  AnuncioInstrumento,
  InsigniaInstrumento,
  SelectorInstrumento,
  instrumentoDeTexto,
  instrumentoPorNombre,
} from '../studio/Instrumento';
import { saveMidi } from '../studio/saveMidi';
import { isDesktop, onMenuAction, requestConvertAudio } from '../desktop';
import { Welcome } from '../studio/Welcome';
import { practice } from '../studio/practice';
import { TutorialPanel } from '../studio/TutorialPanel';

// La partitura (y OpenSheetMusicDisplay) se carga solo al abrir su pestaña.
const ScoreTab = lazy(() => import('../score/ScoreTab').then((m) => ({ default: m.ScoreTab })));
import { VideoSection, openCameraVideo } from '../studio/VideoSection';
import { KeyboardSection, TakesSection } from '../studio/LivePanel';
import { SettingsPanel } from '../studio/SettingsPanel';
import { Timeline } from '../studio/Timeline';
import { transport, useStudio } from '../studio/store';
import type { Aspect } from '../studio/store';
import { formatTime } from '../studio/transport';
import { useOwnAudio } from '../studio/ownAudio';
import { Burbuja } from '../studio/Burbuja';
import styles from './Estudio.module.css';

const ASPECTS = [
  { value: '16:9', label: 'Horizontal 16:9' },
  { value: '9:16', label: 'Vertical 9:16' },
  { value: '1:1', label: 'Cuadrado 1:1' },
] as const;

/** Pedido 34: con audio propio, escuchar la grabación original o el MIDI con nuestros sonidos. */
const ESCUCHAR = [
  { value: 'original', label: 'Original' },
  { value: 'midi', label: 'Nuestros sonidos' },
] as const;

const SPEEDS = [
  { value: '0.5', label: '0,5×' },
  { value: '0.75', label: '0,75×' },
  { value: '1', label: '1×' },
  { value: '1.25', label: '1,25×' },
  { value: '1.5', label: '1,5×' },
] as const;

/** La pestaña de la hoja se llama según el instrumento (pedido de Jacobo). */
const NOMBRE_HOJA: Record<Instrument, string> = {
  piano: 'Partitura',
  guitar: 'Tablatura',
  bass: 'Tablatura',
  drums: 'Partitura de batería',
};

const tabsPara = (instrumento: Instrument) =>
  [
    { id: 'estudio', label: 'Estudio' },
    { id: 'tutorial', label: 'Tutorial' },
    { id: 'partitura', label: NOMBRE_HOJA[instrumento] },
    { id: 'en-vivo', label: 'En vivo' },
  ] as const;

export function Estudio() {
  const take = useStudio((s) => s.take);
  // Instrumento de la hoja: el de la pieza abierta o, sin pieza, el elegido.
  const instrumentoHoja = useStudio((s) => (s.take ? instrumentoDe(s.take) : s.instrumento));
  const [tab, setTab] = useState<'estudio' | 'tutorial' | 'partitura'>('estudio');
  // El tutorial (modo espera, mano que se practica) solo está activo en su pestaña.
  useEffect(() => {
    practice.setActive(tab === 'tutorial');
    return () => practice.setActive(false);
  }, [tab]);
  const notices = useStudio((s) => s.notices);
  const aspect = useStudio((s) => s.aspect);
  const playing = useStudio((s) => s.playing);
  const view = useStudio((s) => s.view);
  const loop = useStudio((s) => s.loop);
  const loopOn = useStudio((s) => s.loopOn);
  const canUndo = useStudio((s) => s.history.length > 0);
  const canRedo = useStudio((s) => s.future.length > 0);
  useEditShortcuts();
  const speed = useStudio((s) => s.speed);
  const audioPropio = useOwnAudio((s) => s.audio);
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
  // App de escritorio: bienvenida al abrir (la animación del logo la hace Inicio, antes).
  const [welcome, setWelcome] = useState(() => isDesktop() && !useStudio.getState().take);
  // Menú nativo de la app de escritorio.
  useEffect(
    () =>
      onMenuAction((action) => {
        const studio = useStudio.getState();
        if (action === 'abrir-midi') fileInput.current?.click();
        else if (action === 'guardar-midi' && studio.take) saveMidi(studio.take);
        else if (action === 'exportar-video' && studio.take) setExportOpen(true);
        else if (action === 'deshacer') studio.undo();
        else if (action === 'rehacer') studio.redo();
        else if (action === 'ver-estudio') setTab('estudio');
        else if (action === 'ver-partitura') setTab('partitura');
      }),
    [],
  );
  const timeRef = useRef<HTMLSpanElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const meterRef = useRef<HTMLSpanElement>(null);
  // Cuadrícula de compases de la toma (para el LCD); null si no tiene tempo.
  const meter = useMemo(() => {
    if (!take || take.tempoMap.length === 0) return null;
    return {
      grid: beatGrid(take.tempoMap, take.timeSignature, take.duration + 2),
      bpm: take.tempoMap[0]!.bpm,
      tempoMap: take.tempoMap,
    };
  }, [take]);
  const meterLive = useRef(meter);
  // Al entrar a una pantalla con sonido, el piano se descarga ya (la animación del logo, si la
  // hay, ya terminó: Inicio monta el estudio después).
  useEffect(() => {
    void engine.preload();
  }, []);
  useEffect(() => {
    meterLive.current = meter;
  }, [meter]);
  const [params] = useSearchParams();
  // Instrumento de cada pieza de "Tus piezas" (se lee una vez al abrir el estudio).
  const [instrLocales, setInstrLocales] = useState<Record<string, Instrument>>({});
  useEffect(() => {
    let vivo = true;
    void Promise.all(
      LOCAL_PIECES.map(async (p) => [p.path, await instrumentoDePieza(p.path)] as const),
    ).then((r) => vivo && setInstrLocales(Object.fromEntries(r)));
    return () => {
      vivo = false;
    };
  }, []);
  // ?instrumento=guitarra (desde la pantalla principal) elige el instrumento.
  useEffect(() => {
    const i = instrumentoDeTexto(params.get('instrumento'));
    if (i) useStudio.getState().setInstrumento(i);
  }, [params]);
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
    const m = meterLive.current;
    if (m && meterRef.current) {
      const b = beatAt(m.grid, t);
      const bpm = tempoAt(m.tempoMap, t);
      meterRef.current.textContent = b ? `c.${b.bar} · ${b.beat}` : 'c.1 · 1';
      const tempoEl = meterRef.current.nextElementSibling;
      if (tempoEl && bpm) tempoEl.textContent = `♩ ${Math.round(bpm)}`;
    }
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
    if (!file) return;
    // Un audio se sincroniza con el MIDI abierto; cualquier otro archivo se lee como MIDI.
    if (file.type.startsWith('video/')) {
      void openCameraVideo(file).then((msg) => setError(msg));
    } else if (file.type.startsWith('audio/') && !/midi/i.test(file.type)) {
      void openOwnAudio(file).then((msg) => setError(msg));
    } else {
      void load(openMidiFile(file));
    }
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
      <header className={`${styles.barra} ui-aparece-texto`}>
        <Link to="/app" className={styles.inicio} aria-label="Ir al inicio de la app">
          <Logo size={18} keyboard={false} />
        </Link>
        <div className={styles.toma}>
          <strong>{take?.title ?? 'Sin pieza abierta'}</strong>
          <span className="ui-secundario">
            {take
              ? `${noteCount.toLocaleString('es')} notas · ${formatTime(take.duration)}`
              : 'Abre un MIDI para empezar'}
          </span>
        </div>
        <SelectorInstrumento />
        <Tabs
          label="Secciones"
          idPrefix="app"
          tabs={tabsPara(instrumentoHoja)}
          value={tab}
          onChange={(id) => {
            if (id === 'en-vivo') void navigate('/en-vivo');
            if (id === 'estudio' || id === 'tutorial' || id === 'partitura') setTab(id);
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
          <Button
            icon={<Download />}
            disabled={!take}
            className="ui-aparece-tecla"
            style={{ '--retraso': '80ms' } as CSSProperties}
            title="Descarga la pieza como .mid, con las manos en pistas separadas y los pedales"
            onClick={() => take && saveMidi(take)}
          >
            Guardar MIDI
          </Button>
          <Button
            icon={<Film />}
            disabled={!take}
            className="ui-aparece-tecla"
            style={{ '--retraso': '120ms' } as CSSProperties}
            onClick={() => setExportOpen(true)}
          >
            Exportar video
          </Button>
          <Button
            variant={device ? 'secondary' : 'primary'}
            className="ui-aparece-tecla"
            style={{ '--retraso': '190ms' } as CSSProperties}
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
              <Button
                variant="primary"
                rec
                className="ui-aparece-tecla"
                style={{ '--retraso': '260ms' } as CSSProperties}
                onClick={startRecording}
              >
                Grabar
              </Button>
            ))}
        </div>
      </header>

      {tab === 'partitura' && (
        <div
          className={styles.cuerpoPartitura}
          role="tabpanel"
          id="app-panel-partitura"
          aria-labelledby="app-tab-partitura"
        >
          <Suspense fallback={<p className="ui-secundario">Cargando la partitura…</p>}>
            <ScoreTab />
          </Suspense>
        </div>
      )}
      <div
        className={styles.cuerpo}
        role="tabpanel"
        id={tab === 'tutorial' ? 'app-panel-tutorial' : 'app-panel-estudio'}
        aria-labelledby={tab === 'tutorial' ? 'app-tab-tutorial' : 'app-tab-estudio'}
        hidden={tab === 'partitura'}
      >
        {tab === 'tutorial' && (
          <aside className={`${styles.panel} ui-aparece-izquierda`} aria-label="Tutorial">
            <TutorialPanel />
          </aside>
        )}
        <aside
          className={`${styles.panel} ui-aparece-izquierda`}
          aria-label="Fuentes y tomas"
          hidden={tab === 'tutorial'}
        >
          <TranscribeStatus />

          <section className={styles.bloque} aria-labelledby="bloque-grabar">
            <h2 id="bloque-grabar" className="ui-etiqueta">
              Grabar
            </h2>
            <KeyboardSection />
            <MicSection />
          </section>

          <TakesSection />

          <section className={styles.bloque} aria-labelledby="bloque-abrir">
            <h2 id="bloque-abrir" className="ui-etiqueta">
              Abrir
            </h2>
            <Button icon={<FileMusic />} onClick={() => fileInput.current?.click()}>
              Abrir un MIDI
            </Button>
            <ConvertAudioButton />
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
              Arrastra un archivo .mid (o su audio) a cualquier parte de la pantalla.
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
                        <span className={styles.nombreFila}>{p.name}</span>
                        {instrLocales[p.path] && (
                          <InsigniaInstrumento instrumento={instrLocales[p.path]!} />
                        )}
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
              {DEMO_PIECES.map((p) => (
                <li key={p.path}>
                  <button
                    type="button"
                    className={styles.fila}
                    onClick={() => void load(openLocalPiece(p.path))}
                  >
                    <span className={styles.nombreFila}>{p.name.replace(/^[^:]*: /, '')}</span>
                    <InsigniaInstrumento instrumento={instrumentoPorNombre(p.name)} />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.bloque} aria-labelledby="bloque-pieza">
            <h2 id="bloque-pieza" className="ui-etiqueta">
              Con esta pieza
            </h2>
            <AudioSection />
            <VideoSection />
          </section>

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

        <main
          className={`${styles.centro} ui-aparece-texto`}
          style={{ '--retraso': '120ms' } as CSSProperties}
        >
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
            <EditBar />
            <AnuncioInstrumento />
            {!take && view !== 'live' && (
              <div className={styles.vacio}>
                <p>Abre un MIDI o arrástralo aquí para verlo caer.</p>
              </div>
            )}
          </div>
        </main>

        <aside
          className={`${styles.panel} ui-aparece-derecha`}
          aria-label="Ajustes del visualizador"
        >
          <SettingsPanel />
        </aside>
      </div>

      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
      {welcome && (
        <Welcome
          onClose={() => setWelcome(false)}
          onOpenMidi={() => fileInput.current?.click()}
          onConvertAudio={requestConvertAudio}
        />
      )}

      <Timeline playheadRef={playheadRef} />
      <footer
        className={`${styles.transporte} ui-aparece-sube`}
        style={{ '--retraso': '160ms' } as CSSProperties}
      >
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
        <Lcd
          size="md"
          aria-label="Tiempo"
          className="ui-aparece-lcd"
          style={{ '--retraso': '420ms' } as CSSProperties}
        >
          <span ref={timeRef}>00:00.00</span>
          <span className={styles.duracion}>/ {formatTime(take?.duration ?? 0)}</span>
        </Lcd>
        {meter && (
          <Lcd
            size="md"
            aria-label="Compás y tempo"
            className="ui-aparece-lcd"
            style={{ '--retraso': '520ms' } as CSSProperties}
          >
            <span ref={meterRef}>c.1 · 1</span>
            <span className={styles.duracion}>♩ {Math.round(meter.bpm)}</span>
          </Lcd>
        )}
        <IconButton
          label="Deshacer (Ctrl+Z)"
          icon={<Undo2 />}
          disabled={!canUndo}
          onClick={() => useStudio.getState().undo()}
        />
        <IconButton
          label="Rehacer (Ctrl+Y)"
          icon={<Redo2 />}
          disabled={!canRedo}
          onClick={() => useStudio.getState().redo()}
        />
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

        {audioPropio && (
          <div className={styles.velocidad}>
            <span className="ui-etiqueta">Escuchar</span>
            <Chips
              label="Qué se escucha"
              options={ESCUCHAR}
              value={audioPropio.use ? 'original' : 'midi'}
              onChange={(v) => useOwnAudio.getState().patch({ use: v === 'original' })}
            />
          </div>
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
      <Burbuja />
    </div>
  );
}
