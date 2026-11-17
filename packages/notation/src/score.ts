import { isPedalDown } from '@impromptu/core';
import type { NoteEvent, PedalEvent, Take } from '@impromptu/core';
import { estimateKey } from './key';
import type { Beats } from './tempo';

/** Divisiones por negra: semicorchea = 3, corchea de tresillo = 4, semicorchea de tresillo = 2. */
export const DIV = 12;

export type NoteType = 'whole' | 'half' | 'quarter' | 'eighth' | '16th';

/** Un acorde, una nota o un silencio (sin alturas) dentro de un compás. */
export interface ScoreEvent {
  /** Posición dentro del compás (divisiones). */
  start: number;
  duration: number;
  /** Alturas MIDI; vacío = silencio. */
  pitches: number[];
  type: NoteType;
  dots: number;
  /** Corchea o semicorchea de tresillo (3 en el tiempo de 2). */
  triplet: boolean;
  tuplet?: 'start' | 'stop';
  /** Ligadura con el trozo siguiente / con el anterior (misma nota partida). */
  tieStart: boolean;
  tieStop: boolean;
  /** Silencio de compás completo. */
  wholeMeasure?: boolean;
}

export interface Measure {
  number: number;
  /** [mano derecha (clave de sol), mano izquierda (clave de fa)]. */
  staves: [ScoreEvent[], ScoreEvent[]];
  /**
   * Pedal de sustain (posición en el compás): pisar, soltar, o cambio (soltar y volver a pisar
   * casi en el mismo punto, que se escribe como una muesca en la línea del pedal).
   */
  pedals: { position: number; type: 'start' | 'stop' | 'change' }[];
}

export interface Score {
  title: string;
  divisions: number;
  /** Armadura: quintas (-7 a 7) y modo. */
  fifths: number;
  mode: 'major' | 'minor';
  time: [number, number];
  bpm: number;
  measures: Measure[];
  /** Para la vista sincronizada: segundo de la toma en que empieza cada compás. */
  measureTimes: number[];
}

export interface ScoreOptions {
  beats: Beats;
  timeSignature?: [number, number];
  /** Hueco máximo que se rellena alargando la nota anterior (divisiones). Por defecto, una negra. */
  legatoGap?: number;
}

/** Posición en negras (con decimales) de un tiempo, según los pulsos. */
export function toBeatPosition(times: readonly number[], t: number): number {
  if (times.length < 2) return t * 2; // sin pulsos: 120 BPM
  let lo = 0;
  let hi = times.length - 1;
  if (t <= times[0]!) return (t - times[0]!) / (times[1]! - times[0]!);
  if (t >= times[hi]!) return hi + (t - times[hi]!) / (times[hi]! - times[hi - 1]!);
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (times[mid]! <= t) lo = mid;
    else hi = mid;
  }
  return lo + (t - times[lo]!) / (times[hi]! - times[lo]!);
}

/** Tiempo (s) de una posición en negras (inversa de toBeatPosition). */
export function toSeconds(times: readonly number[], pos: number): number {
  if (times.length < 2) return pos / 2;
  const i = Math.max(0, Math.min(times.length - 2, Math.floor(pos)));
  return times[i]! + (pos - i) * (times[i + 1]! - times[i]!);
}

/**
 * Cuantiza ataques (en negras) a divisiones. En cada pulso se elige la cuadrícula que mejor
 * encaja: semicorcheas (de a 3) o tresillos de corchea (de a 4). Los tresillos se eligen solo si
 * encajan claramente mejor.
 */
export function quantizeOnsets(positions: readonly number[]): number[] {
  const byBeat = new Map<number, number[]>();
  positions.forEach((p, i) => {
    const beat = Math.floor(p + 1 / 8);
    byBeat.set(beat, [...(byBeat.get(beat) ?? []), i]);
  });
  const out = new Array<number>(positions.length);
  for (const [beat, idx] of byBeat) {
    const err = (sub: number) =>
      idx.reduce((s, i) => {
        const x = (positions[i]! - beat) * sub;
        return s + Math.abs(x - Math.round(x)) / sub;
      }, 0);
    const triplets =
      err(3) < 0.5 * err(4) &&
      idx.some((i) => {
        const x = (positions[i]! - beat) * 3;
        return Math.abs(x - Math.round(x)) < 0.15 && Math.round(x) % 3 !== 0;
      });
    const step = triplets ? DIV / 3 : DIV / 4;
    for (const i of idx) out[i] = Math.max(0, Math.round((positions[i]! * DIV) / step) * step);
  }
  return out;
}

/** Valor escrito de una duración que entra en una sola figura, o null. */
const FIGURES: Record<number, { type: NoteType; dots: number; triplet: boolean }> = {
  48: { type: 'whole', dots: 0, triplet: false },
  36: { type: 'half', dots: 1, triplet: false },
  24: { type: 'half', dots: 0, triplet: false },
  18: { type: 'quarter', dots: 1, triplet: false },
  12: { type: 'quarter', dots: 0, triplet: false },
  9: { type: 'eighth', dots: 1, triplet: false },
  6: { type: 'eighth', dots: 0, triplet: false },
  3: { type: '16th', dots: 0, triplet: false },
  8: { type: 'quarter', dots: 0, triplet: true },
  4: { type: 'eighth', dots: 0, triplet: true },
  2: { type: '16th', dots: 0, triplet: true },
};

/**
 * Parte un tramo [a, b) de un compás en figuras legibles: no cruza el pulso salvo que empiece
 * en uno (negra, blanca, redonda, con puntillo); los tresillos quedan dentro de su pulso.
 */
export function splitFigures(a: number, b: number, measureLength: number): [number, number][] {
  const out: [number, number][] = [];
  let pos = a;
  const stop = Math.min(b, measureLength);
  while (pos < stop) {
    const beatEnd = (Math.floor(pos / DIV) + 1) * DIV;
    const room = stop - pos;
    let len: number;
    if (pos % DIV === 0 && room >= DIV) {
      // Desde un pulso y al menos una negra: redonda, blanca con puntillo, blanca, negra con
      // puntillo o negra (con puntillo solo si lo que sobra sigue siendo binario).
      len = [48, 36, 24, 18, 12].find((o) => o <= room && (room - o) % 3 === 0) ?? DIV;
    } else {
      // Dentro de un pulso: binario (de a 3) o tresillo (de a 2 y 4), sin salir del pulso.
      const inBeat = Math.min(stop, beatEnd) - pos;
      const binary = pos % 3 === 0 && inBeat % 3 === 0;
      const options = binary ? [12, 9, 6, 3] : [8, 4, 2];
      len = options.find((o) => o <= inBeat) ?? inBeat;
    }
    if (len <= 0) len = Math.min(room, 1);
    out.push([pos, pos + len]);
    pos += len;
  }
  return out;
}

interface Span {
  start: number; // divisiones absolutas
  end: number;
  pitches: number[];
}

/** Acordes de un pentagrama con su duración escrita (del ritmo, no del sonido). */
function staffSpans(
  notes: readonly NoteEvent[],
  times: readonly number[],
  sustain: readonly [number, number][],
  legatoGap: number,
): Span[] {
  if (notes.length === 0) return [];
  const sorted = [...notes].sort((a, b) => a.start - b.start || a.pitch - b.pitch);
  const onsets = quantizeOnsets(sorted.map((n) => toBeatPosition(times, n.start)));
  const ends = sorted.map((n) => Math.round((toBeatPosition(times, n.end) * DIV) / 3) * 3);
  const chords = new Map<number, { pitches: Set<number>; end: number }>();
  sorted.forEach((n, i) => {
    const c = chords.get(onsets[i]!) ?? { pitches: new Set<number>(), end: 0 };
    c.pitches.add(n.pitch);
    c.end = Math.max(c.end, ends[i]!);
    chords.set(onsets[i]!, c);
  });
  const starts = [...chords.keys()].sort((a, b) => a - b);
  const pedalUntil = (pos: number) => {
    const r = sustain.find(([a, b]) => a <= pos && pos < b);
    return r ? r[1] : -Infinity;
  };
  return starts.map((start, k) => {
    const c = chords.get(start)!;
    const next = starts[k + 1] ?? Infinity;
    let end = Math.max(c.end, start + 3);
    // El pedal sostiene la nota: escrita hasta soltarlo (o hasta la siguiente).
    end = Math.max(end, pedalUntil(start));
    // Un hueco corto antes de la siguiente nota es articulación, no silencio: se rellena.
    if (next !== Infinity && next - end <= legatoGap) end = next;
    end = Math.min(end, next);
    if (!Number.isFinite(end)) end = start + DIV;
    return { start, end, pitches: [...c.pitches].sort((a, b) => a - b) };
  });
}

/** Rangos [desde, hasta) en divisiones en que el sustain está pisado. */
function sustainRanges(
  pedals: readonly PedalEvent[],
  times: readonly number[],
): [number, number][] {
  const out: [number, number][] = [];
  let down: number | null = null;
  for (const p of [...pedals].filter((x) => x.kind === 'sustain').sort((a, b) => a.time - b.time)) {
    const pos = Math.round((toBeatPosition(times, p.time) * DIV) / 3) * 3;
    if (isPedalDown(p.value) && down === null) down = pos;
    else if (!isPedalDown(p.value) && down !== null) {
      if (pos > down) out.push([down, pos]);
      down = null;
    }
  }
  if (down !== null) out.push([down, Infinity]);
  return out;
}

/** Eventos de un compás para un pentagrama: figuras, silencios, ligaduras y tresillos. */
function measureEvents(spans: readonly Span[], from: number, length: number): ScoreEvent[] {
  const to = from + length;
  const events: ScoreEvent[] = [];
  const push = (a: number, b: number, pitches: number[], tieIn: boolean, tieOut: boolean) => {
    const pieces = splitFigures(a - from, b - from, length);
    pieces.forEach(([pa, pb], i) => {
      const fig = FIGURES[pb - pa] ?? { type: '16th' as NoteType, dots: 0, triplet: false };
      events.push({
        start: pa,
        duration: pb - pa,
        pitches,
        ...fig,
        tieStop: pitches.length > 0 && (i > 0 || tieIn),
        tieStart: pitches.length > 0 && (i < pieces.length - 1 || tieOut),
      });
    });
  };
  let pos = from;
  for (const s of spans) {
    if (s.end <= from || s.start >= to) continue;
    const a = Math.max(s.start, from);
    const b = Math.min(s.end, to);
    if (a > pos) push(pos, a, [], false, false);
    push(a, b, s.pitches, s.start < from, s.end > to);
    pos = b;
  }
  if (pos < to) push(pos, to, [], false, false);
  // Silencio de compás completo.
  if (events.every((e) => e.pitches.length === 0)) {
    return [
      {
        start: 0,
        duration: length,
        pitches: [],
        type: 'whole',
        dots: 0,
        triplet: false,
        tieStart: false,
        tieStop: false,
        wholeMeasure: true,
      },
    ];
  }
  // Corchetes de tresillo: por pulso, del primer al último trozo de tresillo.
  const byBeat = new Map<number, ScoreEvent[]>();
  for (const e of events.filter((x) => x.triplet)) {
    const beat = Math.floor(e.start / DIV);
    byBeat.set(beat, [...(byBeat.get(beat) ?? []), e]);
  }
  for (const group of byBeat.values()) {
    group[0]!.tuplet = 'start';
    group[group.length - 1]!.tuplet = group.length > 1 ? 'stop' : 'start';
    if (group.length === 1) delete group[0]!.tuplet;
  }
  return events;
}

/**
 * Partitura de piano a partir de una toma: dos pentagramas por mano (sin mano asignada, por
 * altura: desde el do central, clave de sol), compases, figuras, silencios, ligaduras, tresillos,
 * armadura estimada y pedal de sustain anotado.
 */
export function buildScore(take: Take, options: ScoreOptions): Score {
  const { beats } = options;
  const times = beats.times;
  const time = options.timeSignature ?? take.timeSignature ?? [4, 4];
  const measureLength = Math.round(time[0] * (4 / time[1]) * DIV);
  const legatoGap = options.legatoGap ?? DIV;
  const notes = take.tracks.filter((t) => t.instrument === 'piano').flatMap((t) => t.notes);
  const pedals = take.tracks.flatMap((t) => t.pedals);
  const sustain = sustainRanges(pedals, times);
  const right = notes.filter((n) => (n.hand ? n.hand === 'R' : n.pitch >= 60));
  const left = notes.filter((n) => (n.hand ? n.hand === 'L' : n.pitch < 60));
  const spans: [Span[], Span[]] = [
    staffSpans(right, times, sustain, legatoGap),
    staffSpans(left, times, sustain, legatoGap),
  ];
  const lastEnd = Math.max(0, ...spans.flat().map((s) => s.end));
  const count = Math.max(1, Math.ceil(lastEnd / measureLength));
  // Los compases vacíos del comienzo (la cuenta del metrónomo, un silencio antes de tocar) no
  // se escriben: la partitura empieza en el compás de la primera nota.
  const firstStart = Math.min(...spans.flat().map((s) => s.start));
  const first = Number.isFinite(firstStart)
    ? Math.min(count - 1, Math.floor(firstStart / measureLength))
    : 0;
  const key = estimateKey(notes);

  const measures: Measure[] = [];
  const measureTimes: number[] = [];
  for (let m = first; m < count; m++) {
    const from = m * measureLength;
    measureTimes.push(toSeconds(times, from / DIV));
    let pedalMarks: Measure['pedals'] = [];
    for (const [a, b] of sustain) {
      if (a >= from && a < from + measureLength)
        pedalMarks.push({ position: a - from, type: 'start' });
      if (b >= from && b < from + measureLength)
        pedalMarks.push({ position: b - from, type: 'stop' });
    }
    pedalMarks = mergePedalChanges(
      pedalMarks.sort((a, b) => a.position - b.position || (a.type === 'stop' ? -1 : 1)),
    );
    measures.push({
      number: m - first + 1,
      staves: [
        measureEvents(spans[0], from, measureLength),
        measureEvents(spans[1], from, measureLength),
      ],
      pedals: pedalMarks,
    });
  }
  return {
    title: take.title,
    divisions: DIV,
    fifths: key.fifths,
    mode: key.mode,
    time,
    bpm: beats.bpm,
    measures,
    measureTimes,
  };
}

/** Soltar y volver a pisar a menos de una semicorchea es un cambio de pedal (una sola marca). */
function mergePedalChanges(marks: Measure['pedals']): Measure['pedals'] {
  const out: Measure['pedals'] = [];
  for (const m of marks) {
    const prev = out[out.length - 1];
    if (prev && prev.type === 'stop' && m.type === 'start' && m.position - prev.position <= 3) {
      prev.type = 'change';
      prev.position = m.position;
      continue;
    }
    out.push({ ...m });
  }
  return out;
}
