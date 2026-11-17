import type { Seconds, TempoPoint } from './model';

/** Un pulso de la cuadrícula: compás y pulso empiezan en 1; el pulso 1 es el inicio del compás. */
export interface Beat {
  time: Seconds;
  bar: number;
  beat: number;
}

const MAX_BEATS = 50_000;

/**
 * Cuadrícula de pulsos y compases a partir del mapa de tempo (BPM en negras) y el compás.
 * Respeta los cambios de tempo aunque caigan a mitad de un pulso. Sin tempo: vacía.
 */
export function beatGrid(
  tempoMap: readonly TempoPoint[],
  timeSignature: readonly [number, number] | undefined,
  duration: Seconds,
): Beat[] {
  const tempos = [...tempoMap].filter((p) => p.bpm > 0).sort((a, b) => a.time - b.time);
  if (tempos.length === 0) return [];
  if (tempos[0]!.time > 0) tempos.unshift({ time: 0, bpm: tempos[0]!.bpm });
  const [numerator, denominator] = timeSignature ?? [4, 4];
  const perBar = Math.max(1, numerator);
  // Duración de un pulso del compás (p. ej. corchea en 6/8) en negras.
  const beatInQuarters = 4 / Math.max(1, denominator);
  const beatLength = (bpm: number) => (60 / bpm) * beatInQuarters;

  const beats: Beat[] = [];
  let t = 0;
  let seg = 0;
  let n = 0;
  while (t <= duration + 1e-9 && beats.length < MAX_BEATS) {
    beats.push({ time: t, bar: Math.floor(n / perBar) + 1, beat: (n % perBar) + 1 });
    n++;
    // Avanzar un pulso, cruzando cambios de tempo si los hay.
    let remaining = 1;
    while (remaining > 0) {
      while (seg + 1 < tempos.length && tempos[seg + 1]!.time <= t) seg++;
      const len = beatLength(tempos[seg]!.bpm);
      const next = tempos[seg + 1]?.time ?? Infinity;
      const fits = (next - t) / len;
      if (fits >= remaining) {
        t += remaining * len;
        remaining = 0;
      } else {
        remaining -= fits;
        t = next;
      }
    }
  }
  return beats;
}

/** Último pulso que ya sonó en t (búsqueda binaria), o null antes del primero o sin cuadrícula. */
export function beatAt(grid: readonly Beat[], t: Seconds): Beat | null {
  let lo = 0;
  let hi = grid.length - 1;
  let found: Beat | null = null;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (grid[mid]!.time <= t + 1e-9) {
      found = grid[mid]!;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return found;
}

/** Tempo vigente en t, o null si la toma no tiene tempo. */
export function tempoAt(tempoMap: readonly TempoPoint[], t: Seconds): number | null {
  let bpm: number | null = null;
  for (const p of tempoMap) {
    if (p.time > t) break;
    bpm = p.bpm;
  }
  return bpm ?? tempoMap[0]?.bpm ?? null;
}
