import { Button, Logo, LogoIntro } from '@impromptu/ui';
import {
  Cable,
  Download,
  Film,
  GitBranch,
  Globe,
  Hand,
  Heart,
  Monitor,
  FileMusic,
  Palette,
  Smartphone,
  Star,
  Video,
} from 'lucide-react';
import { useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { HeroVisualizer } from '../landing/HeroVisualizer';
import { useReveal } from '../landing/useReveal';
import styles from './Landing.module.css';
import { MamutHerdSello } from '../brand/MamutHerdSello';
import { MAMUT_HERD } from '../brand/mamutHerd';

const INTRO_KEY = 'impromptu-intro-vista';
const REPO = 'https://github.com/jjacobolalvarez34-rgb/impromptu';
/** PROVISIONAL(P7): GitHub Sponsors aún no está activado. */
const SPONSORS = 'https://github.com/sponsors/jjacobolalvarez34-rgb';
/** Instaladores (fase 8). null = aún no hay; el botón queda en "Próximamente". */
const DOWNLOADS: { windows: string | null; android: string | null } = {
  windows: null,
  android: null,
};

const delay = (ms: number) => ({ '--retraso': `${ms}ms` }) as CSSProperties;

const FEATURES: { icon: ReactNode; title: string; text: string }[] = [
  {
    icon: <Cable />,
    title: 'Tu teclado, en vivo',
    text: 'Conéctalo por USB y toca: cada nota sale de la tecla con brillo y chispas. Con sustain, sostenuto y una corda, y medio pedal.',
  },
  {
    icon: <Video />,
    title: 'Tus manos en el video',
    text: 'Importa el video de la cámara y calibra las teclas: las notas caen exactamente sobre tu teclado real.',
  },
  {
    icon: <FileMusic />,
    title: 'Tu MIDI y tu audio',
    text: 'Abre el MIDI y el MP3 de tu DAW: se sincronizan solos. O usa el piano de cola incluido, que funciona sin internet.',
  },
  {
    icon: <Film />,
    title: 'Video listo para publicar',
    text: 'MP4 hecho cuadro por cuadro, sin saltos: horizontal, vertical o cuadrado, en 1080p o 4K, a 30 o 60 fps.',
  },
  {
    icon: <Palette />,
    title: 'Tu estilo',
    text: 'Temas, colores por mano, notas brillantes, haces de luz, líneas de compás y velocidad de caída.',
  },
  {
    icon: <Hand />,
    title: 'Hecho por un pianista',
    text: 'Gratis y de código abierto. Todo corre en tu equipo: tu música nunca sale de él.',
  },
];

const STEPS = [
  ['Conecta o abre', 'Tu teclado por USB, o un MIDI con su audio.'],
  ['Toca o reproduce', 'Míralo caer en tiempo real, con pedal y sonido.'],
  ['Dale tu estilo', 'Tema, efectos, cámara y formato del video.'],
  ['Exporta', 'Un MP4 listo para YouTube, Instagram o TikTok.'],
] as const;

const COMING = [
  'Números de dedo',
  'Partitura y PDF',
  'Audio a notas con IA',
  'Modo práctica',
  'Guitarra',
  'Batería',
];

/** Página principal: qué es, cómo funciona, descargas y donaciones (pedido de Jacobo). */
export function Landing() {
  const rootRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [intro, setIntro] = useState(() => {
    if (new URLSearchParams(window.location.search).has('intro')) return true;
    try {
      return sessionStorage.getItem(INTRO_KEY) === null;
    } catch {
      return false;
    }
  });
  useReveal(rootRef);

  const endIntro = () => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      // sin almacenamiento
    }
    setIntro(false);
  };

  return (
    <div ref={rootRef} className={styles.landing}>
      {intro && (
        <div className={styles.intro} onClick={endIntro}>
          <LogoIntro
            size="min(36vw, 32vh, 260px)"
            onDone={() => window.setTimeout(endIntro, 450)}
          />
          <button type="button" className={styles.saltar} onClick={endIntro}>
            Saltar
          </button>
        </div>
      )}

      <nav className={styles.nav} aria-label="Principal">
        <a href="#inicio" className={styles.marca} aria-label="Impromptu, inicio">
          <Logo size={18} keyboard={false} />
        </a>
        <div className={styles.enlaces}>
          <a href="#que-es">Qué es</a>
          <a href="#como">Cómo funciona</a>
          <a href="#descargar">Descargar</a>
          <a href="#apoyar">Apoyar</a>
        </div>
        <Button variant="primary" onClick={() => navigate('/app')}>
          Abrir la app
        </Button>
      </nav>

      <header id="inicio" className={styles.hero}>
        <HeroVisualizer />
        <div className={styles.veloHero} aria-hidden="true" />
        <div className={styles.heroTexto} data-intro={intro}>
          <p className={`${styles.kicker} ui-etiqueta`}>Gratis · Código abierto · En tu equipo</p>
          <h1 className={styles.titulo} aria-label="Videos de piano con notas cayendo">
            {'Videos de piano con notas cayendo'.split(' ').map((word, w, words) => (
              <span key={w} className={styles.palabra}>
                {word.split('').map((ch, i) => {
                  const index = words.slice(0, w).join('').length + i;
                  return (
                    <span
                      key={i}
                      className={styles.letra}
                      style={delay(index * 28)}
                      aria-hidden="true"
                    >
                      {ch}
                    </span>
                  );
                })}
              </span>
            ))}
          </h1>
          <p className={styles.lema}>
            Conecta tu teclado, toca y exporta un video con tus manos, tus pedales y efectos de luz.
            Sin suscripciones.
          </p>
          <div className={styles.ctas}>
            <Button variant="primary" icon={<Globe />} onClick={() => navigate('/app')}>
              Usar en la web
            </Button>
            <a className={styles.ctaSecundario} href="#descargar">
              <Download aria-hidden="true" /> Descargar
            </a>
          </div>
        </div>
        <a href="#que-es" className={styles.bajar} aria-label="Ver más">
          <span />
        </a>
      </header>

      <main>
        <section id="que-es" className={styles.seccion}>
          <Heading kicker="Qué es" title="Todo lo de un estudio de piano, en una sola app" />
          <div className={styles.rejilla}>
            {FEATURES.map((f, i) => (
              <article
                key={f.title}
                className={styles.tarjeta}
                data-revelar="cae"
                style={delay(i * 70)}
              >
                <div className={styles.icono} aria-hidden="true">
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="como" className={styles.seccion}>
          <Heading kicker="Cómo funciona" title="De tu teclado a tu canal en cuatro pasos" />
          <ol className={styles.pasos}>
            <span className={styles.riel} data-revelar="traza" aria-hidden="true" />
            {STEPS.map(([title, text], i) => (
              <li key={title} data-revelar="tecla" style={delay(150 + i * 120)}>
                <span className={styles.numero}>{String(i + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.seccion}>
          <Heading kicker="Lo que viene" title="Más allá de las notas cayendo" />
          <ul className={styles.chips}>
            {COMING.map((c, i) => (
              <li key={c} data-revelar="escala" style={delay(i * 60)}>
                {c}
              </li>
            ))}
          </ul>
        </section>

        <section id="descargar" className={styles.seccion}>
          <Heading kicker="Descargar" title="Úsala donde toques" />
          <div className={styles.descargas}>
            <DownloadCard
              icon={<Globe />}
              title="Web"
              text="Ábrela en Chrome o Edge. Sin instalar nada; se puede instalar como app."
              index={0}
              action={
                <Button variant="primary" onClick={() => navigate('/app')}>
                  Usar en la web
                </Button>
              }
            />
            <DownloadCard
              icon={<Monitor />}
              title="PC"
              text="App para Windows, macOS y Linux, con MIDI nativo y archivos en tu disco."
              index={1}
              href={DOWNLOADS.windows}
            />
            <DownloadCard
              icon={<Smartphone />}
              title="Android"
              text="Instálala en tu celular: graba con tu teclado por OTG, también sin conexión."
              index={2}
              href={DOWNLOADS.android}
            />
          </div>
        </section>

        <section id="apoyar" className={`${styles.seccion} ${styles.apoyar}`} data-revelar="cae">
          <Heart className={styles.corazon} aria-hidden="true" />
          <h2>Impromptu es gratis y lo seguirá siendo</h2>
          <p>
            No hay suscripciones ni funciones bloqueadas. Si te sirve, ayúdanos a mantenerlo y a
            sumar dedos, partitura, tutoriales y más instrumentos.
          </p>
          <div className={styles.ctas}>
            <a className={styles.ctaPrincipal} href={SPONSORS} target="_blank" rel="noreferrer">
              <Heart aria-hidden="true" /> Apoyar el proyecto
            </a>
            <a className={styles.ctaSecundario} href={REPO} target="_blank" rel="noreferrer">
              <Star aria-hidden="true" /> Estrella en GitHub
            </a>
          </div>
        </section>
      </main>

      <footer className={styles.pie}>
        <Logo size={16} keyboard={false} />
        <p>
          Código abierto en{' '}
          <a href={REPO} target="_blank" rel="noreferrer">
            <GitBranch aria-hidden="true" /> GitHub
          </a>
          . Piano: Salamander Grand Piano (Alexander Holm).
        </p>
        <Link to="/acerca">Acerca de</Link>
        <Link to="/app">Abrir la app</Link>
        <div className={styles.firma}>
          <MamutHerdSello />
          <span>{MAMUT_HERD.derechos}</span>
        </div>
      </footer>
    </div>
  );
}

function Heading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className={styles.encabezado}>
      <p className="ui-etiqueta" data-revelar="texto">
        {kicker}
      </p>
      <h2 data-revelar="cae" style={delay(80)}>
        {title}
      </h2>
      <span
        className={styles.subrayado}
        data-revelar="traza"
        style={delay(200)}
        aria-hidden="true"
      />
    </div>
  );
}

function DownloadCard({
  icon,
  title,
  text,
  index,
  href,
  action,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  index: number;
  href?: string | null;
  action?: ReactNode;
}) {
  return (
    <article className={styles.descarga} data-revelar="tecla" style={delay(index * 110)}>
      <div className={styles.icono} aria-hidden="true">
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action ??
        (href ? (
          <a className={styles.ctaPrincipal} href={href}>
            <Download aria-hidden="true" /> Descargar
          </a>
        ) : (
          <span className={styles.pronto}>Próximamente</span>
        ))}
    </article>
  );
}
