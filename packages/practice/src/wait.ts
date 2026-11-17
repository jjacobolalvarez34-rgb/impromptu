import type { Hand, NoteEvent } from '@impromptu/core';

/** Notas que empiezan a menos de esto (s) se tocan juntas (un acorde). */
const CHORD_WINDOW = 0.04;

export interface PracticeChord {
  /** Momento de la toma en que hay que tocarlo. */
  time: number;
  pitches: number[];
}

/** Acordes a tocar, de la mano elegida (o de las dos), en orden. */
export function practiceChords(
  notes: readonly NoteEvent[],
  hand: Hand | 'both',
  from = 0,
  to = Infinity,
): PracticeChord[] {
  const chosen = notes
    .filter((n) => hand === 'both' || n.hand === hand || (n.hand === null && hand === 'R'))
    .filter((n) => n.start >= from - 1e-6 && n.start < to)
    .sort((a, b) => a.start - b.start);
  const chords: PracticeChord[] = [];
  for (const n of chosen) {
    const last = chords[chords.length - 1];
    if (last && n.start - last.time <= CHORD_WINDOW) {
      if (!last.pitches.includes(n.pitch)) last.pitches.push(n.pitch);
    } else chords.push({ time: n.start, pitches: [n.pitch] });
  }
  return chords;
}

export interface WaitStats {
  /** Acordes tocados completos. */
  done: number;
  /** De ellos, tocados sin ninguna tecla equivocada. */
  clean: number;
  /** Teclas equivocadas. */
  wrong: number;
}

/**
 * Modo espera (fase 7): la reproducción se detiene en cada acorde de la mano que se practica y
 * sigue cuando se tocaron todas sus teclas (en cualquier orden; una tecla equivocada no
 * reinicia el acorde, solo cuenta como error).
 */
export class WaitMode {
  private index = 0;
  private pressed = new Set<number>();
  private mistakeHere = false;
  readonly stats: WaitStats = { done: 0, clean: 0, wrong: 0 };

  constructor(readonly chords: readonly PracticeChord[]) {}

  /** El acorde que se espera, o null si ya se terminó. */
  get current(): PracticeChord | null {
    return this.chords[this.index] ?? null;
  }

  /** Teclas del acorde actual que faltan por tocar. */
  get missing(): number[] {
    return this.current?.pitches.filter((p) => !this.pressed.has(p)) ?? [];
  }

  /** Ubica el acorde que sigue a partir de un momento (al buscar o repetir una sección). */
  seek(t: number): void {
    this.index = this.chords.findIndex((c) => c.time >= t - 1e-6);
    if (this.index < 0) this.index = this.chords.length;
    this.pressed.clear();
    this.mistakeHere = false;
  }

  /**
   * Se tocó una tecla. Devuelve true si con ella se completó el acorde (la reproducción sigue).
   */
  press(pitch: number): boolean {
    const chord = this.current;
    if (!chord) return false;
    if (!chord.pitches.includes(pitch)) {
      this.stats.wrong++;
      this.mistakeHere = true;
      return false;
    }
    this.pressed.add(pitch);
    if (this.missing.length > 0) return false;
    this.stats.done++;
    if (!this.mistakeHere) this.stats.clean++;
    this.index++;
    this.pressed.clear();
    this.mistakeHere = false;
    return true;
  }

  /** Precisión: acordes limpios sobre acordes tocados (0–1), o null si aún no hay ninguno. */
  get accuracy(): number | null {
    return this.stats.done > 0 ? this.stats.clean / this.stats.done : null;
  }
}
