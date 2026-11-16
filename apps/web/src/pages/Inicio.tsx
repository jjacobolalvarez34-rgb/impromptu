import { Logo } from '@impromptu/ui';
import { Link } from 'react-router';
import styles from './Inicio.module.css';

export function Inicio() {
  return (
    <main className={styles.inicio}>
      <Logo size="clamp(32px, 11vw, 58px)" />
      <p className="ui-secundario">
        Videos de piano con notas cayendo, gratis y open source. En construcción: fase 0.
      </p>
      <Link className={styles.enlace} to="/componentes">
        Ver componentes
      </Link>
    </main>
  );
}
