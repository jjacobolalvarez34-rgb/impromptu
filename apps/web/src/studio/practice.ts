import { WaitMode, practiceChords } from '@impromptu/practice';
import type { WaitStats } from '@impromptu/practice';
import { create } from 'zustand';
import { engine } from './audio';
import { live } from './live';
import { transport, useStudio } from './store';

/**
 * Tutorial (fase 7): practicar una mano o las dos, con modo espera (la reproducción se detiene
 * en cada acorde hasta que se toca bien) y una precisión discreta, sin juegos.
 */
export type PracticeHand = 'both' | 'R' | 'L';

interface PracticeState {
  active: boolean;
  hand: PracticeHand;
  /** Modo espera: avanza cuando se toca la nota correcta. */
  wait: boolean;
  /** Si se practica una mano, la otra la toca la app. */
  otherHandPlays: boolean;
  /** Teclas que faltan del acorde que se espera (vacío si no se está esperando). */
  waitingFor: number[];
  stats: WaitStats | null;
  accuracy: number | null;
}

export const usePractice = create<PracticeState>(() => ({
  active: false,
  hand: 'both',
  wait: false,
  otherHandPlays: true,
  waitingFor: [],
  stats: null,
  accuracy: null,
}));

let mode: WaitMode | null = null;
let raf = 0;
let unsubscribe: (() => void) | null = null;

/** Rehace el modo espera con la pieza, la mano y la sección actuales. */
function rebuild(): void {
  const { hand, wait } = usePractice.getState();
  const take = useStudio.getState().take;
  if (!wait || !take) {
    mode = null;
    usePractice.setState({ waitingFor: [], stats: null, accuracy: null });
    return;
  }
  const loop = transport.loop;
  const notes = take.tracks.flatMap((t) => t.notes);
  mode = new WaitMode(practiceChords(notes, hand, loop?.start ?? 0, loop?.end ?? Infinity));
  mode.seek(transport.now());
  usePractice.setState({ waitingFor: [], stats: { ...mode.stats }, accuracy: null });
}

/** Qué manos no toca la app: la que se practica (o las dos si "la otra mano" no suena). */
function applyMuting(): void {
  const { active, hand, otherHandPlays } = usePractice.getState();
  if (!active) return engine.setMutedHands([]);
  if (hand === 'both') return engine.setMutedHands(['R', 'L']);
  engine.setMutedHands(otherHandPlays ? [hand] : ['R', 'L']);
}

function onKey(pitch: number): void {
  if (!mode) return;
  const completed = mode.press(pitch);
  usePractice.setState({
    waitingFor: completed || transport.playing ? [] : mode.missing,
    stats: { ...mode.stats },
    accuracy: mode.accuracy,
  });
  // Se completó el acorde que se esperaba: la pieza sigue.
  if (completed && !transport.playing) transport.play();
}

let lastT = 0;

/** Bucle: al llegar al siguiente acorde sin haberlo tocado, se detiene y espera. */
function loop(): void {
  raf = requestAnimationFrame(loop);
  if (!mode) return;
  const t = transport.now();
  // El tiempo volvió atrás (se buscó o se repitió la sección): se reubica.
  if (t < lastT - 0.05) {
    mode.seek(t);
    usePractice.setState({ waitingFor: [] });
  }
  lastT = t;
  if (!transport.playing) return;
  const chord = mode.current;
  if (chord && t >= chord.time) {
    transport.pause();
    transport.seek(chord.time);
    lastT = chord.time;
    usePractice.setState({ waitingFor: mode.missing });
  }
}

export const practice = {
  /** Entrar o salir de la pestaña Tutorial. */
  setActive(active: boolean): void {
    usePractice.setState({ active });
    live.onPractice = active ? onKey : null;
    cancelAnimationFrame(raf);
    unsubscribe?.();
    unsubscribe = null;
    if (active) {
      rebuild();
      raf = requestAnimationFrame(loop);
      // Cambios de pieza o de sección rehacen el modo espera.
      const offStudio = useStudio.subscribe((s, prev) => {
        if (s.take !== prev.take || s.loop !== prev.loop) rebuild();
      });
      unsubscribe = offStudio;
    } else {
      mode = null;
    }
    applyMuting();
  },
  set(patch: Partial<Pick<PracticeState, 'hand' | 'wait' | 'otherHandPlays'>>): void {
    usePractice.setState(patch);
    rebuild();
    applyMuting();
  },
  /** Empezar de nuevo: precisión a cero, desde el inicio de la sección. */
  restart(): void {
    transport.pause();
    transport.seek(transport.loop?.start ?? 0);
    rebuild();
  },
};
