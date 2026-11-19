import { Button, Logo, LogoIntro } from '@impromptu/ui';
import { ArrowLeft, Drum, Guitar, Piano } from 'lucide-react';
import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { MamutHerdSello } from '../brand/MamutHerdSello';
import { MAMUT_HERD } from '../brand/mamutHerd';
import { abrirPantalla, isDesktop } from '../desktop';
import { Recorrido } from '../recorrido/Recorrido';
import styles from './Portada.module.css';

const INTRO_KEY = 'impromptu-intro-vista';

/** Escalonar apariciones: `delay(3)` → 3 × 70 ms. */
const delay = (i: number) => ({ '--retraso': `${i * 70}ms` }) as CSSProperties;

const STEPS = [
  ['Conecta o abre', 'Conecta tu teclado por USB, o abre un MIDI (y su audio si lo tienes).'],
  ['Toca o reproduce', 'Las notas caen sobre el teclado; en vivo, nacen en la tecla y suben.'],
  ['Ajusta', 'Tema, colores por mano, brillo, chispas, compases y formato del video.'],
  ['Exporta', 'Un MP4 cuadro por cuadro, en horizontal, vertical o cuadrado.'],
] as const;

/** Pantalla de inicio: intro animada (una vez por sesión) y elección del instrumento. */
export function Portada() {
  // La intro se muestra en la página principal; aquí solo con `?intro`.
  const [intro, setIntro] = useState(() =>
    new URLSearchParams(window.location.search).has('intro'),
  );
  const navigate = useNavigate();

  // Pedido 43: al terminar, el intro se desvanece en vez de cortarse de golpe.
  const [saliendo, setSaliendo] = useState(false);
  const endIntro = () => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      // Sin almacenamiento: la intro se verá otra vez la próxima vez.
    }
    if (saliendo) return;
    setSaliendo(true);
    window.setTimeout(() => setIntro(false), 520);
  };

  // El intro va encima de la pantalla: al desvanecerse, ya se ve lo de atrás (pedido 43).
  const capaIntro = intro && (
    <div className={styles.intro} data-saliendo={saliendo} onClick={endIntro}>
      <LogoIntro size="min(36vw, 32vh, 260px)" onDone={() => window.setTimeout(endIntro, 500)} />
      <button type="button" className={styles.saltar} onClick={endIntro}>
        Saltar
      </button>
    </div>
  );

  return (
    <div className={styles.portada}>
      {capaIntro}
      <header className={styles.cabecera}>
        {/* De vuelta a la página principal (pedido de Jacobo). En la app de PC no hay página web. */}
        {!isDesktop() && (
          <Link to="/" className={`${styles.volver} ui-aparece-texto`}>
            <ArrowLeft aria-hidden="true" /> Página principal
          </Link>
        )}
        <span className={`${styles.logo} ui-aparece-texto`}>
          <Logo size="clamp(40px, 9vw, 72px)" />
        </span>
        <p className={`${styles.lema} ui-aparece-texto`} style={delay(2)}>
          Videos de piano con notas cayendo. Gratis, en tu equipo, con tu teclado y tus pedales.
        </p>
        <span className={`${styles.trazo} ui-aparece-linea`} style={delay(3)} aria-hidden="true" />
      </header>

      <main className={styles.contenido}>
        {/* Recorrido opcional la primera vez (pedido 37). */}
        <Recorrido />
        <section aria-labelledby="instrumentos" className={styles.instrumentos}>
          <h2 id="instrumentos" className={`ui-etiqueta ui-aparece-texto`} style={delay(3)}>
            Elige tu instrumento
          </h2>
          <div className={styles.tarjetas}>
            <Instrumento
              icon={<Piano />}
              name="Piano"
              text="Estudio de video, en vivo para OBS, grabar tomas y exportar MP4."
              index={4}
            >
              <Button
                variant="primary"
                className="ui-aparece-tecla"
                style={delay(7)}
                onClick={() => abrirPantalla('/estudio?instrumento=piano', navigate)}
              >
                Abrir el estudio
              </Button>
              <Button
                className="ui-aparece-tecla"
                style={delay(8)}
                onClick={() => abrirPantalla('/en-vivo', navigate)}
              >
                Tocar en vivo
              </Button>
            </Instrumento>
            <Instrumento
              icon={<Guitar />}
              name="Guitarra y bajo"
              text="Notas sobre el mástil con cuerda y traste, tablatura y video."
              index={5}
            >
              <Button
                className="ui-aparece-tecla"
                style={delay(8)}
                onClick={() => abrirPantalla('/estudio?instrumento=guitarra', navigate)}
              >
                Abrir con guitarra
              </Button>
            </Instrumento>
            <Instrumento
              icon={<Drum />}
              name="Batería"
              text="Batería electrónica por USB o el micrófono, partitura de batería y video."
              index={6}
            >
              <Button
                className="ui-aparece-tecla"
                style={delay(9)}
                onClick={() => abrirPantalla('/estudio?instrumento=bateria', navigate)}
              >
                Abrir con batería
              </Button>
            </Instrumento>
          </div>
        </section>

        <section aria-labelledby="nube" className={styles.nube}>
          <h2 id="nube" className="ui-etiqueta ui-aparece-texto" style={delay(7)}>
            Próximamente: cuenta y nube
          </h2>
          <p className="ui-secundario ui-aparece-texto" style={delay(8)}>
            Inicia sesión y guarda tus piezas en la nube para abrirlas en el celular, el computador
            o la web. Será con una suscripción y un límite de espacio; todo lo demás sigue gratis.
          </p>
        </section>

        <section aria-labelledby="como" className={styles.como}>
          <h2 id="como" className="ui-etiqueta ui-aparece-texto" style={delay(8)}>
            Cómo se usa
          </h2>
          <ol className={styles.pasos}>
            {STEPS.map(([title, text], i) => (
              <li key={title} className="ui-aparece-izquierda" style={delay(9 + i)}>
                <span className={`${styles.numero} ui-aparece-lcd`} style={delay(10 + i)}>
                  {i + 1}
                </span>
                <div>
                  <strong>{title}</strong>
                  <p className="ui-secundario">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className={styles.pie}>
        <MamutHerdSello />
        <span>{MAMUT_HERD.derechos}</span>
        <Link to="/acerca">Acerca de</Link>
      </footer>
    </div>
  );
}

function Instrumento({
  icon,
  name,
  text,
  index,
  soon = false,
  children,
}: {
  icon: ReactNode;
  name: string;
  text: string;
  index: number;
  soon?: boolean;
  children?: ReactNode;
}) {
  return (
    <article className={`${styles.tarjeta} ui-aparece-cae`} style={delay(index)} data-pronto={soon}>
      <div className={styles.icono} aria-hidden="true">
        {icon}
      </div>
      <h3 className="ui-titulo-panel">{name}</h3>
      <p className="ui-secundario">{text}</p>
      {soon ? (
        <span className={styles.pronto}>Próximamente</span>
      ) : (
        <div className={styles.acciones}>{children}</div>
      )}
    </article>
  );
}
