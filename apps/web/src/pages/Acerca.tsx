import { Logo } from '@impromptu/ui';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { MamutHerdSello } from '../brand/MamutHerdSello';
import { MAMUT_HERD } from '../brand/mamutHerd';
import styles from './Acerca.module.css';

/** Créditos que exigen las licencias (LICENCIAS.md, "Acerca de"). */
const CREDITOS: [string, string][] = [
  ['Sonido de piano', 'Salamander Grand Piano, de Alexander Holm (CC BY 3.0).'],
  [
    'Sonido de batería',
    'MuldjordKit, de Lars Muldjord, en la versión de FreePats (CC BY 4.0); muestras de Sonic Pi (CC0).',
  ],
  [
    'Sonido de guitarra y bajo',
    'FreePats: Spanish Classical Guitar, FSBS Electric Guitar y Electric Bass YR de Andrea Biasior (CC0); FSS Steel String Guitar con muestras de FlameStudios (GPL-3.0 con excepción).',
  ],
  ['Audio a notas', 'Basic Pitch, de Spotify (Apache-2.0), con TensorFlow.js (Apache-2.0).'],
  ['Piano con pedal', 'Transkun V2, © 2021 Yujia Yan (MIT), con ONNX Runtime (MIT).'],
  [
    'Separar instrumentos',
    'Spleeter, de Deezer (MIT), en ONNX de Best-Practice (Apache-2.0), con ONNX Runtime (MIT).',
  ],
  ['Partitura', 'OpenSheetMusicDisplay (BSD-3-Clause).'],
  ['Video', 'Mediabunny (MPL-2.0).'],
  ['Visualizador', 'PixiJS (MIT).'],
  ['Íconos', 'Lucide (ISC).'],
  ['Tipografías', 'Martian Mono y Archivo (SIL Open Font License 1.1).'],
];

/** Pantalla "Acerca de" (kit de marca de Mamut Herd y créditos de licencias). */
export function Acerca() {
  return (
    <div className={styles.acerca}>
      <Link to="/app" className={styles.volver}>
        <ArrowLeft aria-hidden="true" /> Volver
      </Link>
      <header className={styles.cabecera}>
        <Logo size="clamp(36px, 8vw, 56px)" keyboard={false} />
        <p className="ui-secundario">Versión {__APP_VERSION__}</p>
      </header>

      <section className={styles.empresa} aria-labelledby="empresa">
        <h1 id="empresa" className="ui-etiqueta">
          Acerca de
        </h1>
        <MamutHerdSello forma="apilado" />
        <p>{MAMUT_HERD.acercaDe}</p>
        <p className="ui-secundario">
          Contacto:{' '}
          <a href={`mailto:${MAMUT_HERD.correo}`} className={styles.enlace}>
            {MAMUT_HERD.correo}
          </a>
        </p>
      </section>

      <section aria-labelledby="creditos">
        <h2 id="creditos" className="ui-etiqueta">
          Créditos
        </h2>
        <dl className={styles.creditos}>
          {CREDITOS.map(([que, quien]) => (
            <div key={que}>
              <dt>{que}</dt>
              <dd className="ui-secundario">{quien}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className={`${styles.derechos} ui-secundario`}>{MAMUT_HERD.derechos}</p>
    </div>
  );
}
