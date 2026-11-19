import { Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { avanceVisible, useTranscribe } from './transcribeStore';
import { quitarTrabajo, useDescargas, useTrabajos } from './trabajos';
import styles from './Burbuja.module.css';

/**
 * Burbuja de "trabajando por detrás" (pedido 29 de Jacobo): abajo a la derecha, con los videos
 * que se arman y las conversiones de audio a notas. Se abre para ver el avance y cancelar.
 */
export function Burbuja() {
  const trabajos = useTrabajos((s) => s.lista);
  const cola = useTranscribe((s) => s.cola);
  const descargas = useDescargas((s) => s.lista);
  const [abierta, setAbierta] = useState(false);
  // Las conversiones avanzan entre avisos: se refresca dos veces por segundo mientras haya.
  const [ahora, setAhora] = useState(() => performance.now());
  useEffect(() => {
    if (cola.length === 0) return;
    const id = window.setInterval(() => setAhora(performance.now()), 500);
    return () => window.clearInterval(id);
  }, [cola.length]);

  const filas = [
    ...descargas.map((d) => ({
      clave: `d${d.id}`,
      nombre: `Descargando: ${d.nombre}`,
      avance: d.avance as number | null,
      texto: `${Math.round(d.avance * 100)} %`,
      cancelar: undefined as (() => void) | undefined,
      textoCancelar: 'Cancelar',
    })),
    ...trabajos.map((t) => ({
      clave: `t${t.id}`,
      nombre: t.nombre,
      avance: t.estado === 'trabajando' ? t.avance : null,
      texto:
        t.estado === 'listo'
          ? 'Listo: se descargó'
          : t.estado === 'error'
            ? (t.mensaje ?? 'No se pudo')
            : `${Math.round(t.avance * 100)} %`,
      cancelar: t.estado === 'trabajando' ? t.cancelar : () => quitarTrabajo(t.id),
      textoCancelar: t.estado === 'trabajando' ? 'Cancelar' : 'Quitar',
    })),
    ...cola.map((c, i) => {
      const { valor } = avanceVisible(c, ahora);
      return {
        clave: `c${c.id}`,
        nombre: `Convertir: ${c.name}`,
        avance: valor,
        texto:
          c.inicio === null
            ? `En cola (${i} antes)`
            : valor !== null
              ? `${Math.round(valor * 100)} %`
              : 'Preparando…',
        cancelar: () => useTranscribe.getState().cancel(c.id),
        textoCancelar: 'Cancelar',
      };
    }),
  ];
  if (filas.length === 0) return null;
  const trabajando = filas.filter((f) => f.textoCancelar === 'Cancelar').length;
  const primera = filas[0]!;

  return (
    <div className={styles.burbuja} data-abierta={abierta}>
      {abierta && (
        <ul className={styles.lista} aria-label="Trabajos en segundo plano">
          {filas.map((f) => (
            <li key={f.clave} className={styles.fila}>
              <div className={styles.datos}>
                <span className={styles.nombre}>{f.nombre}</span>
                <span className="ui-secundario">{f.texto}</span>
                {f.avance !== null && (
                  <span className={styles.barra} aria-hidden="true">
                    <span style={{ width: `${Math.round(f.avance * 100)}%` }} />
                  </span>
                )}
              </div>
              {f.cancelar && (
                <button type="button" className={styles.cancelar} onClick={f.cancelar}>
                  <X aria-hidden="true" /> {f.textoCancelar}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        className={styles.pastilla}
        aria-expanded={abierta}
        aria-label={`${trabajando} trabajos en segundo plano. ${abierta ? 'Cerrar' : 'Ver'}`}
        onClick={() => setAbierta(!abierta)}
      >
        {trabajando > 0 && <Loader2 className={styles.gira} aria-hidden="true" />}
        <span>
          {trabajando > 0
            ? trabajando === 1
              ? `${primera.nombre.split(':')[0]} · ${primera.texto}`
              : `${trabajando} trabajando`
            : primera.texto}
        </span>
      </button>
    </div>
  );
}
