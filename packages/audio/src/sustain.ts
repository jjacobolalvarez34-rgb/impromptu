import type { NoteEvent, PedalEvent, PedalKind } from '@impromptu/core';
import { isPedalDown } from '@impromptu/core';

/** Una nota lista para sonar: cuándo empieza, cuándo la apagan los apagadores y su ganancia. */
export interface Voice {
  note: NoteEvent;
  start: number;
  /** Momento en que el apagador cae: fin de la nota o, si hay pedal, cuando se suelta. */
  release: number;
  /** 1 normal; menos con una corda pisada. */
  gain: number;
}

const SOFT_GAIN = 0.72;

/** Intervalos [desde, hasta) en que un pedal está abajo (≥ 64, BUGS B-004). */
export function pedalDownRanges(
  pedals: readonly PedalEvent[],
  kind: PedalKind,
): [number, number][] {
  const ranges: [number, number][] = [];
  let downAt: number | null = null;
  for (const p of pedals) {
    if (p.kind !== kind) continue;
    const down = isPedalDown(p.value);
    if (down && downAt === null) downAt = p.time;
    else if (!down && downAt !== null) {
      ranges.push([downAt, p.time]);
      downAt = null;
    }
  }
  if (downAt !== null) ranges.push([downAt, Infinity]);
  return ranges;
}

const rangeAt = (ranges: readonly [number, number][], t: number) =>
  ranges.find(([a, b]) => a <= t && t < b);

/**
 * Calcula cuándo deja de sonar cada nota según los pedales:
 * - Sustain: si está abajo cuando sueltas la tecla, suena hasta que lo sueltas.
 * - Sostenuto: solo sostiene las notas que ya sonaban cuando se pisó.
 * - Una corda: baja la ganancia de las notas que empiezan con él pisado.
 * - Repetir una tecla apaga la nota anterior de esa tecla (la misma cuerda).
 */
export function resolveVoices(
  notes: readonly NoteEvent[],
  pedals: readonly PedalEvent[],
  /** Fin de la toma: un pedal que nunca se suelta apaga sus notas aquí. */
  endTime?: number,
): Voice[] {
  const sustain = pedalDownRanges(pedals, 'sustain');
  const sostenuto = pedalDownRanges(pedals, 'sostenuto');
  const soft = pedalDownRanges(pedals, 'soft');

  const sorted = [...notes].sort((a, b) => a.start - b.start || a.pitch - b.pitch);
  const voices: Voice[] = sorted.map((note) => {
    let release = note.end;
    const s = rangeAt(sustain, note.end);
    if (s) release = Math.max(release, s[1]);
    // El sostenuto atrapa la nota si estaba sonando en el momento de pisarlo.
    const caught = sostenuto.find(([a]) => note.start <= a && a < note.end);
    if (caught) release = Math.max(release, caught[1]);
    return { note, start: note.start, release, gain: rangeAt(soft, note.start) ? SOFT_GAIN : 1 };
  });

  // Pedal pisado hasta el final (nunca se soltó): las notas se apagan al terminar la toma.
  // Un final infinito rompe el audio (setValueAtTime no acepta Infinity).
  const lastNote = sorted.reduce((m, n) => Math.max(m, n.end), 0);
  const end = Math.max(endTime ?? 0, lastNote);
  for (const v of voices) if (!Number.isFinite(v.release)) v.release = Math.max(v.note.end, end);

  // Misma tecla otra vez: la anterior se corta al empezar la nueva.
  const lastByPitch = new Map<number, Voice>();
  for (const v of voices) {
    const prev = lastByPitch.get(v.note.pitch);
    if (prev && prev.release > v.start) prev.release = v.start;
    lastByPitch.set(v.note.pitch, v);
  }
  return voices;
}
