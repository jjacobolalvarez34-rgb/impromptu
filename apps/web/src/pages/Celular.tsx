import { DeviceIndicator, Lcd, Logo } from '@impromptu/ui';
import { Cable, Circle, Library, Mic, Piano, SlidersHorizontal, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { KeyboardSection, TakesSection } from '../studio/LivePanel';
import { SettingsPanel } from '../studio/SettingsPanel';
import { VisualizerView } from '../studio/VisualizerView';
import { live, useLive } from '../studio/live';
import { useStudio } from '../studio/store';
import { formatTime } from '../studio/transport';
import { Estudio } from './Estudio';
import styles from './Celular.module.css';

type Tab = 'grabar' | 'tomas' | 'estudio' | 'ajustes';

const TABS: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: 'grabar', label: 'Grabar', icon: <Mic /> },
  { id: 'tomas', label: 'Tomas', icon: <Library /> },
  { id: 'estudio', label: 'Estudio', icon: <Piano /> },
  { id: 'ajustes', label: 'Ajustes', icon: <SlidersHorizontal /> },
];

/**
 * Vista de celular (DESIGN §5, "Celular (Grabar)"): improvisar y guardar desde el
 * teclado. Será la pantalla principal de la app instalable de Android (ADR-008).
 */
export function Celular() {
  const [tab, setTab] = useState<Tab>('grabar');
  const opened = useStudio((s) => s.take?.id);
  const takeCount = useLive((s) => s.takes.length);
  const firstOpen = useRef(opened);

  // Al abrir una toma desde la lista, se pasa al estudio para verla y oírla.
  useEffect(() => {
    if (opened && opened !== firstOpen.current) setTab('estudio');
    firstOpen.current = opened;
  }, [opened]);

  return (
    <div className={styles.celular} data-tab={tab}>
      <div className={styles.contenido}>
        {tab === 'grabar' && <Grabar />}
        {tab === 'tomas' && (
          <div className={styles.pagina}>
            <h1 className="ui-titulo-pantalla">Tomas</h1>
            <TakesSection />
            {takeCount === 0 && (
              <p className="ui-secundario">Aún no hay tomas. Ve a Grabar y toca algo.</p>
            )}
          </div>
        )}
        {tab === 'estudio' && <Estudio />}
        {tab === 'ajustes' && (
          <div className={styles.pagina}>
            <h1 className="ui-titulo-pantalla">Ajustes</h1>
            <KeyboardSection />
            <SettingsPanel />
          </div>
        )}
      </div>
      <nav className={styles.barra} aria-label="Secciones">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={styles.boton}
            aria-current={tab === t.id ? 'page' : undefined}
            onClick={() => setTab(t.id)}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function Grabar() {
  const status = useLive((s) => s.status);
  const device = useLive((s) => s.device);
  const recording = useLive((s) => s.recording);
  const sustain = useLive((s) => s.sustain);
  const takes = useLive((s) => s.takes);
  const timeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    useStudio.getState().setView('live');
    void live.autoConnect();
  }, []);

  // El tiempo de la toma en el LCD, fuera del ciclo de React.
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      if (timeRef.current) timeRef.current.textContent = formatTime(live.elapsed()).slice(0, 5);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const toggle = async () => {
    if (!recording) {
      live.startRecording();
      return;
    }
    const take = await live.stopRecording();
    if (take) useStudio.getState().open(take);
    useStudio.getState().setView('live');
  };

  return (
    <div className={styles.grabar}>
      <header className={styles.cabecera}>
        <Logo size={18} keyboard={false} />
        {device ? (
          <DeviceIndicator
            name={device.profile.id === 'generic' ? device.name : device.profile.label}
            connected
          />
        ) : (
          <button
            type="button"
            className={styles.conectar}
            onClick={() => void live.connect()}
            disabled={status === 'asking'}
          >
            <Cable aria-hidden="true" />
            {status === 'asking' ? 'Esperando permiso' : 'Conectar teclado'}
          </button>
        )}
      </header>

      <div className={styles.visual}>
        <VisualizerView ratio={4 / 5} />
      </div>

      <div className={styles.control}>
        <Lcd size="lg" aria-label="Tiempo de la toma">
          <span ref={timeRef}>00:00</span>
        </Lcd>
        <button
          type="button"
          className={styles.rec}
          data-grabando={recording}
          disabled={!device}
          aria-label={recording ? 'Detener la grabación' : 'Grabar'}
          onClick={() => void toggle()}
        >
          {recording ? <Square aria-hidden="true" /> : <Circle aria-hidden="true" />}
        </button>
        <span className={styles.pedal} data-pisado={sustain >= 64}>
          <span aria-hidden="true" className={styles.barraPedal}>
            <span style={{ width: `${(sustain / 127) * 100}%` }} />
          </span>
          Ped.
          <span className="ui-oculto">{sustain >= 64 ? ', pisado' : ', suelto'}</span>
        </span>
      </div>
      {!device && status !== 'off' && status !== 'asking' && status !== 'ready' && (
        <p role="alert" className={styles.aviso}>
          Este navegador no puede leer teclados MIDI. En Android usa Chrome con un cable OTG.
        </p>
      )}

      {takes.length > 0 && (
        <section className={styles.recientes} aria-label="Tomas recientes">
          <h2 className="ui-etiqueta">Tomas recientes</h2>
          <ul>
            {takes.slice(0, 3).map((t) => (
              <li key={t.id}>
                <span>{t.title}</span>
                <span className="ui-secundario ui-mono">{formatTime(t.duration).slice(0, 5)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
