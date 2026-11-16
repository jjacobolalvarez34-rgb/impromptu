import { Button, LogoIntro, Switch } from '@impromptu/ui';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import styles from './Intro.module.css';

/**
 * Demostración de la animación de marca a pantalla completa.
 * Con `?video` oculta los controles para grabarla (ver scripts/export-intro.mjs).
 */
export function Intro() {
  const [take, setTake] = useState(0);
  const [loop, setLoop] = useState(false);
  const [params] = useSearchParams();
  const video = params.has('video');

  return (
    <main className={styles.page}>
      <div className={styles.stage}>
        <LogoIntro
          key={take}
          size={video ? 'min(32vw, 36vh)' : 'min(40vw, 30vh, 260px)'}
          loop={loop}
        />
      </div>
      {!video && (
        <div className={styles.controls}>
          <Button variant="secondary" onClick={() => setTake((n) => n + 1)}>
            Repetir
          </Button>
          <Switch label="En bucle" checked={loop} onChange={setLoop} />
        </div>
      )}
    </main>
  );
}
