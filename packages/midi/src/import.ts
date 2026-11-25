import { parseMidi } from 'midi-file';
import type { MidiData, MidiEvent } from 'midi-file';
import {
  createNoteEvent,
  createTake,
  createTrack,
  fitKeyboardRange,
  pedalKindFromCC,
  sortPedals,
} from '@impromptu/core';
import type { IdFactory, NoteEvent, PedalEvent, Take, TempoPoint, Track } from '@impromptu/core';
import { createTempoMap } from './tempo';

export type ImportWarning =
  | { code: 'unclosed-notes'; track: string; count: number }
  | { code: 'duplicate-track-removed'; track: string; duplicateOf: string }
  | { code: 'no-notes' };

export interface ImportOptions {
  title?: string;
  /** Quita pistas que repiten las mismas notas (por ejemplo, una parte doblada en dos instrumentos). */
  dedupeTracks?: boolean;
  newId?: IdFactory;
  now?: () => Date;
}

export interface ImportResult {
  take: Take;
  warnings: ImportWarning[];
}

/** Tolerancia de ataque y proporción mínima de notas iguales para tratar dos pistas como la misma parte. */
const SAME_TIME = 0.25;
const SAME_RATIO = 0.95;
const DRUM_CHANNEL = 9;

interface RawTrack {
  name: string;
  notes: NoteEvent[];
  pedals: PedalEvent[];
  channels: Set<number>;
  /** Primer programa General MIDI de la pista (instrumento), o null. */
  program: number | null;
  unclosed: number;
}

/**
 * Instrumento de una pista (fase 9): canal 10 = batería; programas General MIDI 24–31 = guitarra y
 * 32–39 = bajo; lo demás, piano.
 */
function instrumentoDePista(r: RawTrack): Track['instrument'] {
  if (r.channels.size === 1 && r.channels.has(DRUM_CHANNEL)) return 'drums';
  if (r.program !== null && r.program >= 24 && r.program <= 31) return 'guitar';
  if (r.program !== null && r.program >= 32 && r.program <= 39) return 'bass';
  return 'piano';
}

/**
 * Convierte un archivo .mid en una toma. Aplica las trampas de docs/BUGS.md:
 * velocity 0 = note-off (B-001), notas sin cerrar (B-002) y pedal con el valor
 * completo 0–127 (B-004). El running status lo resuelve el parser.
 */
export function importMidi(bytes: Uint8Array, options: ImportOptions = {}): ImportResult {
  const data = parseMidi(bytes);
  const newId = options.newId;
  const toSeconds = createTempoMap(data);
  const warnings: ImportWarning[] = [];

  const raws = data.tracks.map((events, i) => readTrack(events, i, toSeconds, newId));
  for (const r of raws) {
    if (r.unclosed > 0) warnings.push({ code: 'unclosed-notes', track: r.name, count: r.unclosed });
  }

  let noted = raws.filter((r) => r.notes.length > 0);
  if (options.dedupeTracks ?? true) {
    const kept: RawTrack[] = [];
    for (const r of noted) {
      const twin = kept.find((k) => sameNotes(k.notes, r.notes));
      if (twin)
        warnings.push({ code: 'duplicate-track-removed', track: r.name, duplicateOf: twin.name });
      else kept.push(r);
    }
    noted = kept;
  }

  // Pistas solo con pedal (Cakewalk suele dejar el pedal en su propia pista): su pedal
  // se aplica a las pistas con notas.
  const loosePedals = raws.filter((r) => r.notes.length === 0).flatMap((r) => r.pedals);

  const tracks: Track[] = noted.map((r) =>
    createTrack(
      {
        instrument: instrumentoDePista(r),
        name: r.name,
        notes: r.notes,
        pedals: sortPedals([...r.pedals, ...loosePedals]),
      },
      newId,
    ),
  );
  if (tracks.length === 0) warnings.push({ code: 'no-notes' });

  const take = createTake(
    {
      title: options.title ?? 'Sin título',
      tracks,
      tempoMap: tempoPoints(data, toSeconds),
      keyboardRange: fitKeyboardRange(tracks.flatMap((t) => t.notes.map((n) => n.pitch))),
      ...meterAndKey(data),
    },
    newId,
    options.now,
  );
  return { take, warnings };
}

function readTrack(
  events: MidiEvent[],
  index: number,
  toSeconds: (tick: number) => number,
  newId: IdFactory | undefined,
): RawTrack {
  const track: RawTrack = {
    name: `Pista ${index + 1}`,
    notes: [],
    pedals: [],
    channels: new Set(),
    program: null,
    unclosed: 0,
  };
  // Note-ons abiertos por canal y tecla, en orden de llegada (FIFO).
  const open = new Map<number, { start: number; velocity: number }[]>();
  let tick = 0;

  const close = (channel: number, pitch: number, end: number) => {
    const queue = open.get(channel * 128 + pitch);
    const on = queue?.shift();
    if (!on) return; // note-off huérfano: se ignora
    track.notes.push(
      createNoteEvent(
        {
          pitch,
          start: on.start,
          end: Math.max(end, on.start),
          velocity: on.velocity,
          channel,
          origin: 'midi-file',
        },
        newId,
      ),
    );
  };

  for (const e of events) {
    tick += e.deltaTime;
    const t = toSeconds(tick);
    switch (e.type) {
      case 'trackName':
        if (e.text.trim()) track.name = e.text.trim();
        break;
      case 'noteOn':
        track.channels.add(e.channel);
        if (e.velocity === 0) {
          close(e.channel, e.noteNumber, t); // B-001
        } else {
          const key = e.channel * 128 + e.noteNumber;
          const queue = open.get(key) ?? [];
          queue.push({ start: t, velocity: Math.min(127, Math.max(1, e.velocity)) });
          open.set(key, queue);
        }
        break;
      case 'noteOff':
        close(e.channel, e.noteNumber, t);
        break;
      case 'programChange':
        track.program ??= e.programNumber;
        break;
      case 'controller': {
        const kind = pedalKindFromCC(e.controllerType);
        if (kind) track.pedals.push({ kind, time: t, value: e.value }); // B-004: valor completo
        break;
      }
    }
  }

  // B-002: las notas sin note-off se cierran al final de la pista.
  const end = toSeconds(tick);
  for (const [key, queue] of open) {
    while (queue.length > 0) {
      track.unclosed++;
      close(Math.floor(key / 128), key % 128, end);
    }
  }
  return track;
}

/**
 * Dos pistas son la misma parte si tienen las mismas teclas y casi todos los ataques
 * coinciden. Admite una copia cuantizada de una toma en vivo (Nostalgia de Jacobo:
 * 832 de 842 ataques iguales; el resto corrido hasta 0,14 s por la cuadrícula).
 */
function sameNotes(a: readonly NoteEvent[], b: readonly NoteEvent[]): boolean {
  if (a.length !== b.length || a.length === 0) return false;
  const byPitch = new Map<number, number[]>();
  for (const m of b) {
    const list = byPitch.get(m.pitch) ?? [];
    list.push(m.start);
    byPitch.set(m.pitch, list);
  }
  let matched = 0;
  for (const n of a) {
    const starts = byPitch.get(n.pitch);
    if (!starts) return false;
    let best = -1;
    for (let i = 0; i < starts.length; i++) {
      const d = Math.abs(starts[i]! - n.start);
      if (d <= SAME_TIME && (best < 0 || d < Math.abs(starts[best]! - n.start))) best = i;
    }
    if (best >= 0) {
      starts.splice(best, 1);
      matched++;
    }
  }
  return matched / a.length >= SAME_RATIO;
}

function tempoPoints(data: MidiData, toSeconds: (tick: number) => number): TempoPoint[] {
  const points: TempoPoint[] = [];
  for (const events of data.tracks) {
    let tick = 0;
    for (const e of events) {
      tick += e.deltaTime;
      if (e.type === 'setTempo') {
        points.push({ time: toSeconds(tick), bpm: 60_000_000 / e.microsecondsPerBeat });
      }
    }
  }
  points.sort((x, y) => x.time - y.time);
  // Varios cambios en el mismo instante: vale el último.
  return points.filter((p, i) => points[i + 1]?.time !== p.time);
}

const MAJOR_KEYS = [
  'Cb',
  'Gb',
  'Db',
  'Ab',
  'Eb',
  'Bb',
  'F',
  'C',
  'G',
  'D',
  'A',
  'E',
  'B',
  'F#',
  'C#',
];
const MINOR_KEYS = [
  'Ab',
  'Eb',
  'Bb',
  'F',
  'C',
  'G',
  'D',
  'A',
  'E',
  'B',
  'F#',
  'C#',
  'G#',
  'D#',
  'A#',
];

function meterAndKey(data: MidiData): Pick<Take, 'timeSignature' | 'keySignature'> {
  const result: Pick<Take, 'timeSignature' | 'keySignature'> = {};
  for (const events of data.tracks) {
    for (const e of events) {
      if (e.type === 'timeSignature' && !result.timeSignature) {
        result.timeSignature = [e.numerator, e.denominator];
      }
      if (e.type === 'keySignature' && !result.keySignature) {
        const names = e.scale === 1 ? MINOR_KEYS : MAJOR_KEYS;
        const name = names[e.key + 7];
        if (name) result.keySignature = `${name} ${e.scale === 1 ? 'minor' : 'major'}`;
      }
    }
  }
  return result;
}
