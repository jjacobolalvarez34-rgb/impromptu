import { writeMidi } from 'midi-file';
import type { MidiData, MidiEvent } from 'midi-file';
import type {
  NoteEvent,
  PedalEvent,
  PedalKind,
  Take,
  TempoPoint,
  Instrument,
} from '@impromptu/core';

/** Resolución del archivo: 480 ticks por negra, la más común en los DAW. */
const PPQ = 480;
const DEFAULT_BPM = 120;
const PEDAL_CC: Record<PedalKind, number> = { sustain: 64, sostenuto: 66, soft: 67 };

/** Convierte segundos a ticks siguiendo el mapa de tempo (escalonado, como en un MIDI). */
export function secondsToTicks(tempoMap: readonly TempoPoint[]): (t: number) => number {
  const points = tempoMap.length > 0 ? [...tempoMap] : [{ time: 0, bpm: DEFAULT_BPM }];
  if (points[0]!.time > 0) points.unshift({ time: 0, bpm: points[0]!.bpm });
  // Tick donde empieza cada tramo de tempo.
  const startTicks: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    startTicks.push(startTicks[i - 1]! + ((points[i]!.time - prev.time) * prev.bpm * PPQ) / 60);
  }
  return (t) => {
    let i = points.length - 1;
    while (i > 0 && points[i]!.time > t) i--;
    const p = points[i]!;
    return Math.max(0, Math.round(startTicks[i]! + ((t - p.time) * p.bpm * PPQ) / 60));
  };
}

interface Timed {
  tick: number;
  /** A igual tick: primero se sueltan notas, después pedal, después se tocan. */
  order: number;
  event: MidiEvent;
}

function toTrack(name: string, timed: Timed[]): MidiEvent[] {
  timed.sort((a, b) => a.tick - b.tick || a.order - b.order);
  const events: MidiEvent[] = [{ deltaTime: 0, meta: true, type: 'trackName', text: name }];
  let last = 0;
  for (const t of timed) {
    events.push({ ...t.event, deltaTime: t.tick - last } as MidiEvent);
    last = t.tick;
  }
  events.push({ deltaTime: 0, meta: true, type: 'endOfTrack' });
  return events;
}

function noteEvents(notes: readonly NoteEvent[], ticks: (t: number) => number, channel: number) {
  const out: Timed[] = [];
  for (const n of notes) {
    const on = ticks(n.start);
    const off = Math.max(on + 1, ticks(n.end));
    const velocity = Math.min(127, Math.max(1, Math.round(n.velocity)));
    out.push({
      tick: on,
      order: 2,
      event: { deltaTime: 0, type: 'noteOn', channel, noteNumber: n.pitch, velocity },
    });
    out.push({
      tick: off,
      order: 0,
      event: { deltaTime: 0, type: 'noteOff', channel, noteNumber: n.pitch, velocity: 0 },
    });
  }
  return out;
}

function pedalEvents(pedals: readonly PedalEvent[], ticks: (t: number) => number, channel: number) {
  return pedals.map<Timed>((p) => ({
    tick: ticks(p.time),
    order: 1,
    event: {
      deltaTime: 0,
      type: 'controller',
      channel,
      controllerType: PEDAL_CC[p.kind],
      value: Math.min(127, Math.max(0, Math.round(p.value))),
    },
  }));
}

/**
 * Escribe la toma como MIDI estándar (tipo 1), para abrirla en cualquier DAW o editor de partituras.
 * - Pista 0: tempo, compás y armadura.
 * - Si hay manos asignadas: una pista por mano ("Mano derecha", "Mano izquierda"), como en una
 *   partitura de piano; si no, una pista por cada pista de la toma.
 * - Pedales como CC64 (sustain), CC66 (sostenuto) y CC67 (una corda), en la primera pista.
 */
const DRUM = 9;

export function exportMidi(take: Take): Uint8Array {
  const ticks = secondsToTicks(take.tempoMap);
  const tempoMap = take.tempoMap.length > 0 ? take.tempoMap : [{ time: 0, bpm: DEFAULT_BPM }];

  const conductor: Timed[] = tempoMap.map((p) => ({
    tick: ticks(p.time),
    order: 0,
    event: {
      deltaTime: 0,
      meta: true,
      type: 'setTempo',
      microsecondsPerBeat: Math.round(60_000_000 / p.bpm),
    },
  }));
  if (take.timeSignature) {
    conductor.push({
      tick: 0,
      order: 0,
      event: {
        deltaTime: 0,
        meta: true,
        type: 'timeSignature',
        numerator: take.timeSignature[0],
        denominator: take.timeSignature[1],
        metronome: 24,
        thirtyseconds: 8,
      },
    });
  }

  // El piano va por manos (si las tiene); guitarra, bajo y batería (fase 9) en su propia pista,
  // con su programa General MIDI (la batería en el canal 10).
  const piano = take.tracks.filter((t) => t.instrument === 'piano');
  const otros = take.tracks.filter((t) => t.instrument !== 'piano');
  const allNotes = piano.flatMap((t) => t.notes);
  const allPedals = take.tracks.flatMap((t) => t.pedals).sort((a, b) => a.time - b.time);
  const byHand = allNotes.some((n) => n.hand !== null);
  type Parte = { name: string; notes: NoteEvent[]; pedals: PedalEvent[]; instrument: Instrument };
  const partes: Parte[] = byHand
    ? [
        {
          name: 'Mano derecha',
          notes: allNotes.filter((n) => n.hand !== 'L'),
          pedals: allPedals,
          instrument: 'piano',
        },
        {
          name: 'Mano izquierda',
          notes: allNotes.filter((n) => n.hand === 'L'),
          pedals: [],
          instrument: 'piano',
        },
      ]
    : piano.map((t, i) => ({
        name: t.name,
        notes: t.notes,
        pedals: i === 0 ? allPedals : [],
        instrument: 'piano',
      }));
  for (const t of otros)
    partes.push({ name: t.name, notes: t.notes, pedals: [], instrument: t.instrument });

  const PROGRAMA: Record<Instrument, number> = { piano: 0, guitar: 25, bass: 33, drums: 0 };
  let canal = 0;
  const tracks = [
    toTrack(take.title, conductor),
    ...partes
      .filter((p) => p.notes.length > 0 || p.pedals.length > 0)
      .map((p) => {
        // El canal 10 (índice 9) es solo de batería.
        const channel = p.instrument === 'drums' ? DRUM : Math.min(canal++, 8);
        const program: Timed = {
          tick: 0,
          order: -1,
          event: {
            deltaTime: 0,
            type: 'programChange',
            channel,
            programNumber: PROGRAMA[p.instrument],
          },
        };
        return toTrack(p.name, [
          program,
          ...noteEvents(p.notes, ticks, channel),
          ...pedalEvents(p.pedals, ticks, channel),
        ]);
      }),
  ];
  const data: MidiData = {
    header: { format: 1, numTracks: tracks.length, ticksPerBeat: PPQ },
    tracks,
  };
  return Uint8Array.from(writeMidi(data));
}
