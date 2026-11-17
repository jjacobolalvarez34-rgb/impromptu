import { LogoIntro } from '@impromptu/ui';
import { useState, useSyncExternalStore } from 'react';
import { Celular } from './Celular';
import { Estudio } from './Estudio';
import styles from './Inicio.module.css';

const NARROW = '(max-width: 720px), (max-height: 500px) and (max-width: 1000px)';
const INTRO_KEY = 'impromptu-intro-vista';

function subscribe(onChange: () => void) {
  const query = window.matchMedia(NARROW);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/**
 * Pantalla de inicio de las apps: en el celular, "Piezas primero"; en pantallas anchas, el
 * Estudio (DESIGN §5). Con `?intro` (apps instaladas) abre con la animación del logo, una vez
 * por sesión; mientras corre, solo ella: lo demás se monta después para que no se trabe.
 */
export function Inicio() {
  const narrow = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(NARROW).matches,
    () => false,
  );
  const [intro, setIntro] = useState(() => {
    try {
      return (
        new URLSearchParams(window.location.search).has('intro') &&
        sessionStorage.getItem(INTRO_KEY) === null
      );
    } catch {
      return false;
    }
  });
  const endIntro = () => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      // Sin almacenamiento: la animación puede volver a salir.
    }
    setIntro(false);
  };

  if (intro) {
    return (
      <div className={styles.intro} onClick={endIntro}>
        <LogoIntro size="min(36vw, 32vh, 260px)" onDone={() => window.setTimeout(endIntro, 500)} />
        <button type="button" className={styles.saltar} onClick={endIntro}>
          Saltar
        </button>
      </div>
    );
  }
  return narrow ? <Celular /> : <Estudio />;
}
