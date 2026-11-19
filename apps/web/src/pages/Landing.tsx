import { Button, Logo, LogoIntro } from '@impromptu/ui';
import {
  AudioLines,
  Cable,
  Download,
  Drum,
  Guitar,
  Piano,
  Film,
  GitBranch,
  Globe,
  Hand,
  Heart,
  Monitor,
  FileMusic,
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
/**
 * Instaladores (pedido 23): la última versión publicada en GitHub. PROVISIONAL: hasta que Jacobo
 * publique la primera versión ahí (el APK firmado y el instalador de PC ya están armados).
 */
const RELEASES = `${REPO}/releases/latest`;
const DOWNLOADS: { windows: string | null; android: string | null } = {
  windows: RELEASES,
  android: RELEASES,
};

/** Cada instrumento con lo suyo (pedido 37: que no se sature todo en una sola lista). */
const INSTRUMENTOS = [
  {
    id: 'piano',
    nombre: 'Piano',
    icono: <Piano />,
    puntos: [
      'Tu teclado por USB, con sustain, sostenuto, una corda y medio pedal a la vista.',
      'Manos de colores y números de dedo para tutoriales.',
      'Calidad del piano a elegir: hasta las 16 capas del Salamander Grand Piano.',
      'Grabación directo en la partitura mientras tocas.',
    ],
  },
  {
    id: 'guitarra',
    nombre: 'Guitarra y bajo',
    icono: <Guitar />,
    puntos: [
      'Cada nota cae sobre su traste y su cuerda, con el número bien legible.',
      'Panel de rasgueo: flechas que te dicen abajo, arriba o silencio.',
      'Tablatura editable (sola o con la partitura) y afinaciones Drop D y medio tono abajo.',
      'Sonidos grabados: nylon, acero, eléctrica y bajo.',
    ],
  },
  {
    id: 'bateria',
    nombre: 'Batería',
    icono: <Drum />,
    puntos: [
      'Carriles por pieza o una vista de batería real: los golpes bajan hasta cada parche.',
      'Hi-hat abierto o cerrado a la vista y el pulso del tempo en una esquina, con clic.',
      'Partitura de batería editable.',
      'Una batería de rock grabada, con golpes suaves y fuertes.',
    ],
  },
] as const;

const delay = (ms: number) => ({ '--retraso': `${ms}ms` }) as CSSProperties;

const FEATURES: { icon: ReactNode; title: string; text: string }[] = [
  {
    icon: <AudioLines />,
    title: 'De audio a notas',
    text: 'Graba con el micrófono o abre una canción: la IA la pasa a notas. Con una canción completa, primero separa tu instrumento del resto, como Moises.',
  },
  {
    icon: <FileMusic />,
    title: 'Partitura y tablatura',
    text: 'Se escriben solas y se editan tocando la nota. Exporta MusicXML, MIDI, PDF o un video de la hoja con su línea de lectura.',
  },
  {
    icon: <Film />,
    title: 'Video listo para publicar',
    text: 'MP4 cuadro por cuadro en horizontal, vertical o cuadrado, hasta 4K. Se arma en segundo plano y se descarga solo.',
  },
  {
    icon: <Video />,
    title: 'Tus manos en el video',
    text: 'Importa el video de la cámara y calibra: las notas caen exactamente sobre tu instrumento real.',
  },
  {
    icon: <Cable />,
    title: 'Practica y transmite',
    text: 'Modo práctica que espera tus notas, y una vista en vivo para OBS mientras tocas.',
  },
  {
    icon: <Hand />,
    title: 'Hecho por un músico',
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
  'Cuenta y nube (opcional)',
  'Teclado más realista',
  'Más sonidos de instrumentos',
  'IA más precisa para guitarra y batería',
];

/** Página principal: qué es, cómo funciona, descargas y donaciones (pedido de Jacobo). */
export function Landing() {
  const rootRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [instrumento, setInstrumento] = useState<(typeof INSTRUMENTOS)[number]['id']>('piano');
  const elegido = INSTRUMENTOS.find((i) => i.id === instrumento) ?? INSTRUMENTOS[0];
  const [intro, setIntro] = useState(() => {
    if (new URLSearchParams(window.location.search).has('intro')) return true;
    try {
      return sessionStorage.getItem(INTRO_KEY) === null;
    } catch {
      return false;
    }
  });
  useReveal(rootRef);

  // Pedido 43: al terminar, el intro se desvanece en vez de cortarse de golpe.
  const [saliendo, setSaliendo] = useState(false);
  const endIntro = () => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      // sin almacenamiento
    }
    if (saliendo) return;
    setSaliendo(true);
    window.setTimeout(() => setIntro(false), 520);
  };

  return (
    <div ref={rootRef} className={styles.landing}>
      {intro && (
        <div className={styles.intro} data-saliendo={saliendo} onClick={endIntro}>
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
          <a href="#instrumentos">Instrumentos</a>
          <a href="#que-es">Qué hace</a>
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
          <h1 className={styles.titulo} aria-label="Videos de música con notas cayendo">
            {'Videos de música con notas cayendo'.split(' ').map((word, w, words) => (
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
            Piano, guitarra, bajo y batería. Conecta tu instrumento o abre un audio, y exporta un
            video con tus manos, la partitura y efectos de luz. Sin suscripciones.
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
        <a href="#instrumentos" className={styles.bajar} aria-label="Ver más">
          <span />
        </a>
      </header>

      <main>
        <section id="instrumentos" className={styles.seccion}>
          <Heading kicker="Instrumentos" title="Elige el tuyo" />
          <div
            className={styles.pestanas}
            role="tablist"
            aria-label="Instrumento"
            data-revelar="cae"
          >
            {INSTRUMENTOS.map((i) => (
              <button
                key={i.id}
                type="button"
                role="tab"
                id={`pestana-${i.id}`}
                aria-selected={instrumento === i.id}
                aria-controls="panel-instrumento"
                className={styles.pestana}
                onClick={() => setInstrumento(i.id)}
              >
                <span aria-hidden="true">{i.icono}</span>
                {i.nombre}
              </button>
            ))}
          </div>
          <div
            id="panel-instrumento"
            role="tabpanel"
            aria-labelledby={`pestana-${elegido.id}`}
            className={styles.panelInstrumento}
            key={elegido.id}
          >
            <ul>
              {elegido.puntos.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
            <Button
              variant="primary"
              onClick={() => navigate(`/estudio?instrumento=${elegido.id}`)}
            >
              Abrir con {elegido.nombre.toLowerCase()}
            </Button>
          </div>
        </section>

        <section id="que-es" className={styles.seccion}>
          <Heading kicker="Qué hace" title="Para todos los instrumentos" />
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
          <Heading kicker="Cómo funciona" title="De tu instrumento a tu canal en cuatro pasos" />
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
          <p className={styles.recorrido} data-revelar="texto">
            ¿Primera vez? <Link to="/app?recorrido">Haz el recorrido de un minuto</Link> por la app.
          </p>
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
              text="App para Windows, con MIDI nativo, archivos en tu disco y la IA sin internet."
              index={1}
              href={DOWNLOADS.windows}
            />
            <DownloadCard
              icon={<Smartphone />}
              title="Android"
              text="Instálala en tu celular: graba con tu instrumento por OTG o con el micrófono, también sin conexión."
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
            sumar más instrumentos, sonidos y una IA más precisa.
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
          <a className={styles.ctaPrincipal} href={href} target="_blank" rel="noreferrer">
            <Download aria-hidden="true" /> Descargar en GitHub
          </a>
        ) : (
          <span className={styles.pronto}>Próximamente</span>
        ))}
    </article>
  );
}
