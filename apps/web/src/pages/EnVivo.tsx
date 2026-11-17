import { Button, Chips } from '@impromptu/ui';
import type { Background } from '@impromptu/render';
import { ArrowLeft, Cable } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { live, useLive } from '../studio/live';
import { useStudio } from '../studio/store';
import { VisualizerView } from '../studio/VisualizerView';
import styles from './EnVivo.module.css';

const BACKGROUNDS = [
  { value: 'tema', label: 'Tema' },
  { value: 'verde', label: 'Verde' },
  { value: 'transparente', label: 'Transparente' },
] as const;
type BackgroundChoice = (typeof BACKGROUNDS)[number]['value'];

const TO_BACKGROUND: Record<BackgroundChoice, Background> = {
  tema: 'theme',
  verde: 0x00ff00, // verde de croma para recortar en OBS
  transparente: 'transparent',
};

/** Segundos sin mover el mouse antes de esconder los controles (no salen en la transmisión). */
const HIDE_AFTER = 2500;

/**
 * Modo en vivo para transmitir (ARQUITECTURA, "En vivo y OBS"): solo el visualizador a
 * pantalla completa. `?fondo=verde|transparente|tema` deja el fondo fijo desde la URL.
 */
export function EnVivo() {
  const [params, setParams] = useSearchParams();
  const fondo = (params.get('fondo') ?? 'verde') as BackgroundChoice;
  const choice: BackgroundChoice = fondo in TO_BACKGROUND ? fondo : 'verde';
  const status = useLive((s) => s.status);
  const device = useLive((s) => s.device);
  const [visible, setVisible] = useState(true);
  const timer = useRef(0);

  useEffect(() => {
    useStudio.getState().setView('live');
    // Si el permiso MIDI ya se dio antes, se conecta solo (útil al reabrir en OBS).
    void navigator.permissions
      ?.query({ name: 'midi' as PermissionName })
      .then((p) => {
        if (p.state === 'granted' && useLive.getState().status === 'off') void live.connect();
      })
      .catch(() => undefined);
  }, []);

  // Con fondo transparente, también la página debe serlo (fuente de navegador de OBS).
  useEffect(() => {
    if (choice !== 'transparente') return;
    const html = document.documentElement;
    html.style.background = document.body.style.background = 'transparent';
    return () => {
      html.style.background = document.body.style.background = '';
    };
  }, [choice]);

  useEffect(() => {
    const show = () => {
      setVisible(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setVisible(false), HIDE_AFTER);
    };
    show();
    window.addEventListener('pointermove', show);
    window.addEventListener('keydown', show);
    return () => {
      window.clearTimeout(timer.current);
      window.removeEventListener('pointermove', show);
      window.removeEventListener('keydown', show);
    };
  }, []);

  return (
    <main className={styles.envivo} data-fondo={choice}>
      <VisualizerView fill background={TO_BACKGROUND[choice]} />
      <div className={styles.controles} data-visible={visible} aria-hidden={!visible}>
        <Link to="/" className={styles.volver}>
          <ArrowLeft aria-hidden="true" /> Estudio
        </Link>
        <Chips
          label="Fondo"
          options={BACKGROUNDS}
          value={choice}
          onChange={(v) => setParams({ fondo: v }, { replace: true })}
        />
        {device ? (
          <span className="ui-secundario">{device.name}</span>
        ) : (
          <Button
            icon={<Cable />}
            disabled={status === 'asking'}
            onClick={() => void live.connect()}
          >
            Conectar teclado
          </Button>
        )}
      </div>
    </main>
  );
}
