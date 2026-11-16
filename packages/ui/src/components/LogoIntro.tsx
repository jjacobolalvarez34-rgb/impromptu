import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { AnimationEvent, CSSProperties } from 'react';
import styles from './LogoIntro.module.css';

export interface LogoIntroProps {
  /**
   * Se llama cuando queda el ícono final. Con `loop`, en cada vuelta.
   * Con movimiento reducido, enseguida.
   */
  onDone?: () => void;
  /** Repite la animación tras una pausa sobre el ícono final (marketing). */
  loop?: boolean;
  /**
   * Lado del ícono final: px como número, o una longitud CSS (`min(40vw, 260px)`).
   * El componente mide el doble de ancho, porque la palabra inicial es más larga que el ícono.
   */
  size?: number | string;
  /** false congela la animación en el cuadro actual. */
  playing?: boolean;
  /**
   * Borde de 1 px `--linea` por fuera del cuadrado, para que se lea sobre fondo carbón.
   * Queda fuera del ícono: por dentro, el final es idéntico a assets/brand/icon.svg.
   */
  edge?: boolean;
}

/* ---------------------------------------------------------------------------------------------
 * Geometría. Todo se mide en u = size / 100: el ícono final ocupa 0–100 u, igual que el
 * viewBox de icon.svg. La palabra reproduce Logo.tsx con tamaño de letra de 30 u.
 * Métricas de Martian Mono 400: avance 0,7 em, ascendente 1,0 em y descendente 0,2 em.
 * ------------------------------------------------------------------------------------------- */
const FONT = 30;
/** Avance por letra: 0,7 em más el espaciado −0,0345 em del Logo. */
const ADVANCE = 0.7 - 0.0345;
const LETTERS = ['ı', 'm', 'p', 'r', 'o', 'm', 'p', 't', 'u'] as const;
const WORD_W = LETTERS.length * ADVANCE * FONT;
const WORD_X = 50 - WORD_W / 2;
/** Línea ámbar del Logo: la composición (de la nota al teclado) queda centrada en 50 u. */
const LINE_Y = 50 + 0.34 * FONT;
/** Arriba de la palabra: línea ámbar menos el hueco de 0,08 em y el alto de línea de 1 em. */
const WORD_Y = LINE_Y - 1.08 * FONT;
const LOGO_KEYS = 10;
const LOGO_KEY_W = WORD_W / LOGO_KEYS;

/** Teclado de icon.svg: 6 teclas de 11 u cada 12,2 u desde x = 14. */
const ICON_KEYS = 6;
const iconKeyX = (i: number) => 14 + 12.2 * i;

/** Notas de icon.svg. La primera es la nota de la "i" que llega volando. */
const NOTE_1 = { x: 22, y: 42, h: 22 };
const FALLING_NOTES = [
  { x: 46, y: 24, h: 28, dim: false },
  { x: 66, y: 46, h: 14, dim: true },
] as const;

/**
 * Dónde dibuja Logo.module.css la nota de la "i": left 50 % − 0,078 em (el translateX(−60 %)),
 * bottom 0,66 em sobre la caja de la "ı" (que baja 0,2 em del renglón), 0,13 × 0,36 em.
 * Si cambia esa regla del Logo, cambia esto.
 */
const WORD_NOTE = {
  x: WORD_X + (ADVANCE / 2 - 0.078) * FONT,
  y: WORD_Y + (0.9 + 0.2 - 0.66 - 0.36) * FONT,
  w: 0.13 * FONT,
  h: 0.36 * FONT,
};

/* ---------------------------------------------------------------------------------------------
 * Coreografía (ms). Las notas del ícono caen a velocidad constante, como en el visualizador.
 * ------------------------------------------------------------------------------------------- */
const T = {
  lineIn: 0,
  lineInDur: 260,
  noteFall: 120,
  noteFallDur: 360,
  land: 480,
  letterStep: 40,
  letterInDur: 120,
  drain: 1300,
  drainStep: 30,
  drainDur: 200,
  flashLead: 70,
  gather: 1760,
  gatherDur: 360,
  box: 1940,
  boxDur: 340,
  note2: 2280,
  note3: 2360,
} as const;
/** u por ms. */
const FALL_SPEED = 0.2;
const fallDur = (n: { y: number; h: number }) => Math.round((n.y + n.h) / FALL_SPEED);
const HANDOFF = T.gather + T.gatherDur;
const TOTAL =
  Math.max(
    T.note2 + fallDur(FALLING_NOTES[0]),
    T.note3 + fallDur(FALLING_NOTES[1]),
    T.box + T.boxDur,
  ) + 40;
const LOOP_PAUSE = 1600;

/** Tecla que suena cuando la letra j cae a través de la línea (la que está debajo de su centro). */
const keyUnderLetter = (j: number) => Math.floor((j * ADVANCE + 0.35) / (ADVANCE * 0.9));

const r = (n: number) => Math.round(n * 1e4) / 1e4;
const vars = (o: Record<string, number | string>) => o as CSSProperties;

const ROOT_VARS = {
  '--word-x': r(WORD_X),
  '--word-y': r(WORD_Y),
  '--word-w': r(WORD_W),
  '--line-y': r(LINE_Y),
  '--note-dx': r(NOTE_1.x - WORD_NOTE.x),
  '--note-dy': r(NOTE_1.y - WORD_NOTE.y),
  '--note-sx': r(11 / WORD_NOTE.w),
  '--note-sy': r(NOTE_1.h / WORD_NOTE.h),
  '--t-line-in': T.lineIn,
  '--d-line-in': T.lineInDur,
  '--t-note-fall': T.noteFall,
  '--d-note-fall': T.noteFallDur,
  '--t-land': T.land,
  '--d-letter-in': T.letterInDur,
  '--d-drain': T.drainDur,
  '--t-gather': T.gather,
  '--d-gather': T.gatherDur,
  '--t-box': T.box,
  '--d-box': T.boxDur,
  '--t-handoff': HANDOFF,
  '--d-total': TOTAL,
};

const LETTER_STYLES = LETTERS.map((_, j) =>
  vars({
    '--x': r(WORD_X + j * ADVANCE * FONT),
    '--t-in': T.land + j * T.letterStep,
    '--t-out': T.drain + j * T.drainStep,
  }),
);

const KEY_STYLES = Array.from({ length: LOGO_KEYS }, (_, i) => {
  const letter = LETTERS.findIndex((_, j) => j > 0 && keyUnderLetter(j) === i);
  const kept = i < ICON_KEYS;
  return vars({
    '--x0': r(WORD_X + i * LOGO_KEY_W),
    '--w0': r(LOGO_KEY_W),
    '--x1': r(kept ? iconKeyX(i) : iconKeyX(ICON_KEYS - 1) + 11),
    '--w1': kept ? 11 : 0,
    '--t-reveal': Math.round(T.lineIn + ((i + 1) / LOGO_KEYS) * T.lineInDur),
    // Sin letra encima, el destello queda fuera de la animación.
    '--t-flash': letter > 0 ? T.drain + letter * T.drainStep + T.flashLead : -1e5,
    '--d-flash': T.drainDur - T.flashLead,
  });
});

const NOTE_STYLES = FALLING_NOTES.map((n, k) =>
  vars({
    '--x': n.x,
    '--y': n.y,
    '--h': n.h,
    '--t-fall': k === 0 ? T.note2 : T.note3,
    '--d-fall': fallDur(n),
  }),
);

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeReduced(onChange: () => void) {
  const query = window.matchMedia(REDUCED_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  );
}

const FONT_QUERY = '400 16px "Martian Mono"';

/** Espera a Martian Mono (empaquetada, carga rápido) para no animar con la fuente de respaldo. */
function useFontReady() {
  const [ready, setReady] = useState(
    () => typeof document === 'undefined' || !document.fonts || document.fonts.check(FONT_QUERY),
  );
  useEffect(() => {
    if (ready) return;
    let alive = true;
    const finish = () => {
      if (alive) setReady(true);
    };
    document.fonts.load(FONT_QUERY, 'ımpromptu').then(finish, finish);
    const timer = window.setTimeout(finish, 800);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [ready]);
  return ready;
}

/**
 * Animación de marca: el logo de texto se transforma en el ícono de la app (DESIGN §1).
 * Pantalla de arranque y marketing. Solo CSS: cada pieza lleva su retraso en la línea de tiempo.
 */
export function LogoIntro({
  onDone,
  loop = false,
  size = 160,
  playing = true,
  edge = true,
}: LogoIntroProps) {
  const reduced = useReducedMotion();
  const fontReady = useFontReady();
  const [run, setRun] = useState(0);
  const [finished, setFinished] = useState(false);

  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  // Movimiento reducido: el ícono final aparece quieto y se avisa enseguida.
  useEffect(() => {
    if (reduced) onDoneRef.current?.();
  }, [reduced]);

  useEffect(() => {
    if (!finished || !loop || !playing || reduced) return;
    const timer = window.setTimeout(() => {
      setFinished(false);
      setRun((n) => n + 1);
    }, LOOP_PAUSE);
    return () => window.clearTimeout(timer);
  }, [finished, loop, playing, reduced]);

  const handleClockEnd = (event: AnimationEvent<HTMLSpanElement>) => {
    if (event.target !== event.currentTarget) return;
    setFinished(true);
    onDoneRef.current?.();
  };

  const paused = !reduced && (!playing || !fontReady);

  return (
    <span
      role="img"
      aria-label="impromptu"
      className={styles.intro}
      data-reduced={reduced}
      data-paused={paused}
      data-edge={edge}
      style={vars({
        '--intro-size': typeof size === 'number' ? `${size}px` : size,
        ...ROOT_VARS,
      })}
    >
      <span key={run} className={styles.stage} aria-hidden="true">
        <span className={styles.box} />

        <span className={styles.notes}>
          <span className={styles.note1} />
          {FALLING_NOTES.map((n, k) => (
            <span
              key={n.x}
              className={styles.fallingNote}
              data-dim={n.dim}
              style={NOTE_STYLES[k]}
            />
          ))}
        </span>

        <span className={styles.letters}>
          {LETTERS.map((ch, j) => (
            <span key={j} className={styles.letter} style={LETTER_STYLES[j]}>
              {ch}
            </span>
          ))}
        </span>

        {/* Réplica exacta de la palabra del Logo, en tinta transparente: solo se ve su nota. */}
        <span className={styles.word}>
          <span className={styles.i}>
            ı<span className={styles.wordNote} />
          </span>
          mpromptu
        </span>

        {KEY_STYLES.map((style, i) => (
          <span
            key={i}
            className={styles.key}
            data-first={i === 0}
            data-dropped={i >= ICON_KEYS}
            style={style}
          />
        ))}
        <span className={styles.line} />

        {!reduced && <span className={styles.clock} onAnimationEnd={handleClockEnd} />}
      </span>
    </span>
  );
}
