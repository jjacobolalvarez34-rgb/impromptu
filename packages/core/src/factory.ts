import type { Instrument, NoteEvent, PedalEvent, Take, Track } from './model';

/** Rango del Yamaha PSR-E343 (61 teclas, C2–C7), teclado por defecto. */
export const KEYBOARD_61 = { low: 36, high: 96 } as const;

export type IdFactory = () => string;
// core no depende del DOM ni de Node: Web Crypto existe en ambos (Node ≥ 19).
type WithCrypto = { crypto: { randomUUID(): string } };
const defaultId: IdFactory = () => (globalThis as unknown as WithCrypto).crypto.randomUUID();

type NoteInput = Pick<NoteEvent, 'pitch' | 'start' | 'end' | 'velocity' | 'origin'> &
  Partial<Omit<NoteEvent, 'pitch' | 'start' | 'end' | 'velocity' | 'origin'>>;

/**
 * Crea una nota con mano y dedo sin asignar (null), como pide ADR-003.
 */
export function createNoteEvent(input: NoteInput, newId: IdFactory = defaultId): NoteEvent {
  return {
    id: newId(),
    hand: null,
    handSource: null,
    finger: null,
    fingerSource: null,
    ...input,
  };
}

export function createTrack(
  input: {
    instrument?: Instrument;
    name?: string;
    notes?: NoteEvent[];
    pedals?: PedalEvent[];
  } = {},
  newId: IdFactory = defaultId,
): Track {
  return {
    id: newId(),
    instrument: input.instrument ?? 'piano',
    name: input.name ?? 'Piano',
    notes: sortNotes(input.notes ?? []),
    pedals: sortPedals(input.pedals ?? []),
  };
}

export function createTake(
  input: Partial<Omit<Take, 'id'>> & { title: string },
  newId: IdFactory = defaultId,
  now: () => Date = () => new Date(),
): Take {
  const tracks = input.tracks ?? [];
  return {
    createdAt: now().toISOString(),
    duration: input.duration ?? takeEnd(tracks),
    tracks,
    tempoMap: [],
    media: [],
    keyboardRange: { ...KEYBOARD_61 },
    ...input,
    id: newId(),
  };
}

/** Ordena por `start` (y por `pitch` en empate). Devuelve un arreglo nuevo. */
export function sortNotes(notes: readonly NoteEvent[]): NoteEvent[] {
  return [...notes].sort((a, b) => a.start - b.start || a.pitch - b.pitch);
}

/** Ordena por `time`. El orden es estable: respeta el de llegada en empates. */
export function sortPedals(pedals: readonly PedalEvent[]): PedalEvent[] {
  return [...pedals].sort((a, b) => a.time - b.time);
}

/** Último instante con sonido o pedal en todas las pistas. */
export function takeEnd(tracks: readonly Track[]): number {
  let end = 0;
  for (const t of tracks) {
    for (const n of t.notes) end = Math.max(end, n.end);
    for (const p of t.pedals) end = Math.max(end, p.time);
  }
  return end;
}
