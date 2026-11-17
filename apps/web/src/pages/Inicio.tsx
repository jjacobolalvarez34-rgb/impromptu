import { useSyncExternalStore } from 'react';
import { Celular } from './Celular';
import { Estudio } from './Estudio';

const NARROW = '(max-width: 720px)';

function subscribe(onChange: () => void) {
  const query = window.matchMedia(NARROW);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/** Pantalla de inicio: en el celular, Grabar (DESIGN §5); en pantallas anchas, el Estudio. */
export function Inicio() {
  const narrow = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(NARROW).matches,
    () => false,
  );
  return narrow ? <Celular /> : <Estudio />;
}
