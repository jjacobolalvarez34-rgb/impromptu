import apilado from './mamut-herd/un-producto-de-mamut-herd-apilado-para-fondo-oscuro.svg?url';
import linea from './mamut-herd/un-producto-de-mamut-herd-linea-para-fondo-oscuro.svg?url';
import { MAMUT_HERD } from './mamutHerd';
import styles from './MamutHerdSello.module.css';

/** Proporción ancho/alto de cada forma (viewBox de los SVG del kit), para no saltar al cargar. */
const PROPORCION = { linea: 1193.55 / 208, apilado: 741.28 / 274 } as const;

/**
 * Sello "Un producto de Mamut Herd" (kit de marca). Impromptu solo tiene tema oscuro, así que
 * se usa la versión "para fondo oscuro". El texto viene dentro del SVG: no se reescribe.
 * - `linea`: pie de página (20–28 px de alto).
 * - `apilado`: pantalla "Acerca de" (160–220 px de ancho).
 */
export function MamutHerdSello({
  forma = 'linea',
  alto = forma === 'linea' ? 22 : 64,
}: {
  forma?: 'linea' | 'apilado';
  alto?: number;
}) {
  return (
    <a className={styles.sello} href={MAMUT_HERD.enlace} title={`Escribir a ${MAMUT_HERD.correo}`}>
      <img
        src={forma === 'linea' ? linea : apilado}
        alt={MAMUT_HERD.firma}
        height={alto}
        width={Math.round(alto * PROPORCION[forma])}
      />
    </a>
  );
}
