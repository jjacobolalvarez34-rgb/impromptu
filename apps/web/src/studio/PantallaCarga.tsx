import { Button, Logo } from '@impromptu/ui';
import { saltarCarga, useDescargas } from './trabajos';
import styles from './PantallaCarga.module.css';

/**
 * Pantalla de carga al entrar al estudio (pedido 45 de Jacobo): mientras baja lo necesario
 * (piano, sonidos del instrumento) se ve qué se descarga y cuánto falta. Se va sola al terminar
 * o con "Seguir sin esperar"; después las descargas siguen en la burbuja.
 */
export function PantallaCarga() {
  const lista = useDescargas((s) => s.lista);
  const inicioListo = useDescargas((s) => s.inicioListo);
  // En las pruebas automáticas no tapa el estudio, salvo que se pida con ?carga.
  const automatica =
    navigator.webdriver && !new URLSearchParams(window.location.search).has('carga');
  if (inicioListo || lista.length === 0 || automatica) return null;
  return (
    <div className={styles.carga} role="dialog" aria-modal="true" aria-label="Preparando Impromptu">
      <div className={styles.caja}>
        <Logo size={28} keyboard={false} />
        <p className="ui-etiqueta">Preparando Impromptu</p>
        <ul className={styles.lista}>
          {lista.map((d) => (
            <li key={d.id}>
              <span>{d.nombre}</span>
              <span className={styles.barra} aria-hidden="true">
                <span style={{ width: `${Math.round(d.avance * 100)}%` }} />
              </span>
              <span className="ui-mono">{Math.round(d.avance * 100)} %</span>
            </li>
          ))}
        </ul>
        <p className="ui-secundario">Solo la primera vez: después queda guardado en tu equipo.</p>
        <Button onClick={saltarCarga}>Seguir sin esperar</Button>
      </div>
    </div>
  );
}
