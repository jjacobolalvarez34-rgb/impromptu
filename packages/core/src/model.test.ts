import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  KEYBOARD_61,
  createNoteEvent,
  createTake,
  createTrack,
  sortNotes,
  sortPedals,
  takeEnd,
  validateNoteEvent,
  validateTake,
  validateTrack,
} from './index';
import type {
  Finger,
  Hand,
  Instrument,
  KeyboardCalibration,
  MediaRef,
  NoteEvent,
  PedalEvent,
  PedalKind,
  Take,
  TempoPoint,
  Track,
  VisualProject,
} from './index';

let n = 0;
const seqId = () => `id-${++n}`;
const fixedNow = () => new Date('2026-11-16T12:00:00.000Z');

describe('tipos del modelo (contrato de ARQUITECTURA.md)', () => {
  it('uniones exactas', () => {
    expectTypeOf<Hand>().toEqualTypeOf<'L' | 'R'>();
    expectTypeOf<Finger>().toEqualTypeOf<1 | 2 | 3 | 4 | 5>();
    expectTypeOf<Instrument>().toEqualTypeOf<'piano' | 'guitar' | 'bass' | 'drums'>();
    expectTypeOf<PedalKind>().toEqualTypeOf<'sustain' | 'sostenuto' | 'soft'>();
    expectTypeOf<NoteEvent['origin']>().toEqualTypeOf<
      'midi-live' | 'midi-file' | 'audio' | 'edit'
    >();
    expectTypeOf<VisualProject['layout']>().toEqualTypeOf<
      'visualizer' | 'camera-top' | 'camera-inset' | 'background'
    >();
    expectTypeOf<VisualProject['aspect']>().toEqualTypeOf<'16:9' | '9:16' | '1:1'>();
  });

  it('NoteEvent guarda mano y dedo desde el día 1 (ADR-003)', () => {
    expectTypeOf<NoteEvent['hand']>().toEqualTypeOf<Hand | null>();
    expectTypeOf<NoteEvent['finger']>().toEqualTypeOf<Finger | null>();
    expectTypeOf<NoteEvent['handSource']>().toEqualTypeOf<'auto' | 'user' | null>();
    expectTypeOf<NoteEvent['fingerSource']>().toEqualTypeOf<'auto' | 'user' | null>();
    expectTypeOf<NoteEvent>().toHaveProperty('voice').toEqualTypeOf<number | undefined>();
    expectTypeOf<NoteEvent>().toHaveProperty('string').toEqualTypeOf<number | undefined>();
    expectTypeOf<NoteEvent>().toHaveProperty('fret').toEqualTypeOf<number | undefined>();
    expectTypeOf<NoteEvent>().toHaveProperty('drumPiece').toEqualTypeOf<string | undefined>();
  });

  it('estructuras', () => {
    expectTypeOf<PedalEvent>().toEqualTypeOf<{ kind: PedalKind; time: number; value: number }>();
    expectTypeOf<TempoPoint>().toEqualTypeOf<{ time: number; bpm: number }>();
    expectTypeOf<Track['notes']>().toEqualTypeOf<NoteEvent[]>();
    expectTypeOf<Track['pedals']>().toEqualTypeOf<PedalEvent[]>();
    expectTypeOf<Take['keyboardRange']>().toEqualTypeOf<{ low: number; high: number }>();
    expectTypeOf<Take['timeSignature']>().toEqualTypeOf<[number, number] | undefined>();
    expectTypeOf<MediaRef['calibration']>().toEqualTypeOf<KeyboardCalibration | undefined>();
    expectTypeOf<VisualProject['show']['pedals']>().toEqualTypeOf<PedalKind[]>();
  });
});

describe('createNoteEvent', () => {
  it('deja mano y dedo en null', () => {
    const note = createNoteEvent(
      { pitch: 60, start: 0, end: 1, velocity: 80, origin: 'midi-file' },
      seqId,
    );
    expect(note).toMatchObject({ hand: null, handSource: null, finger: null, fingerSource: null });
    expect(note.id).toMatch(/^id-/);
    expect(validateNoteEvent(note)).toEqual([]);
  });

  it('respeta mano y dedo dados por el usuario', () => {
    const note = createNoteEvent(
      {
        pitch: 64,
        start: 0,
        end: 1,
        velocity: 80,
        origin: 'edit',
        hand: 'R',
        handSource: 'user',
        finger: 3,
        fingerSource: 'user',
      },
      seqId,
    );
    expect(note).toMatchObject({ hand: 'R', finger: 3 });
  });

  it('genera ids únicos por defecto', () => {
    const a = createNoteEvent({ pitch: 60, start: 0, end: 1, velocity: 1, origin: 'audio' });
    const b = createNoteEvent({ pitch: 60, start: 0, end: 1, velocity: 1, origin: 'audio' });
    expect(a.id).not.toBe(b.id);
  });
});

describe('validateNoteEvent', () => {
  const base = createNoteEvent(
    { pitch: 60, start: 1, end: 2, velocity: 64, origin: 'midi-live' },
    seqId,
  );

  it('rechaza velocity 0: eso es un note-off, no una nota (BUGS B-001)', () => {
    expect(validateNoteEvent({ ...base, velocity: 0 })).toHaveLength(1);
  });

  it('rechaza pitch fuera de 0–127 y no enteros', () => {
    expect(validateNoteEvent({ ...base, pitch: 128 })).toHaveLength(1);
    expect(validateNoteEvent({ ...base, pitch: -1 })).toHaveLength(1);
    expect(validateNoteEvent({ ...base, pitch: 60.5 })).toHaveLength(1);
  });

  it('rechaza end antes de start y tiempos no finitos', () => {
    expect(validateNoteEvent({ ...base, end: 0.5 })).toHaveLength(1);
    expect(validateNoteEvent({ ...base, start: Number.NaN })).not.toEqual([]);
    expect(validateNoteEvent({ ...base, end: Number.POSITIVE_INFINITY })).toHaveLength(1);
  });

  it('acepta notas de duración cero (ataques sueltos)', () => {
    expect(validateNoteEvent({ ...base, end: base.start })).toEqual([]);
  });

  it('rechaza origen de mano o dedo sin valor', () => {
    expect(validateNoteEvent({ ...base, handSource: 'auto' })).toHaveLength(1);
    expect(validateNoteEvent({ ...base, fingerSource: 'user' })).toHaveLength(1);
  });
});

describe('pistas y tomas', () => {
  const note = (pitch: number, start: number, end: number) =>
    createNoteEvent({ pitch, start, end, velocity: 70, origin: 'midi-file' }, seqId);

  it('createTrack ordena notas por start (y pitch en empate) y pedales por time', () => {
    const track = createTrack(
      {
        notes: [note(67, 2, 3), note(64, 0, 1), note(60, 0, 1)],
        pedals: [
          { kind: 'sustain', time: 1.5, value: 0 },
          { kind: 'sustain', time: 0.2, value: 127 },
        ],
      },
      seqId,
    );
    expect(track.notes.map((x) => x.pitch)).toEqual([60, 64, 67]);
    expect(track.pedals.map((p) => p.time)).toEqual([0.2, 1.5]);
    expect(track).toMatchObject({ instrument: 'piano', name: 'Piano' });
    expect(validateTrack(track)).toEqual([]);
  });

  it('sortNotes y sortPedals no mutan la entrada', () => {
    const notes = [note(60, 2, 3), note(60, 0, 1)];
    const pedals: PedalEvent[] = [
      { kind: 'soft', time: 2, value: 0 },
      { kind: 'soft', time: 1, value: 127 },
    ];
    sortNotes(notes);
    sortPedals(pedals);
    expect(notes[0]?.start).toBe(2);
    expect(pedals[0]?.time).toBe(2);
  });

  it('validateTrack detecta desorden y pedales fuera de rango', () => {
    const track: Track = {
      id: 't',
      instrument: 'piano',
      name: 'x',
      notes: [note(60, 2, 3), note(60, 0, 1)],
      pedals: [{ kind: 'sustain', time: 0, value: 200 }],
    };
    const errors = validateTrack(track);
    expect(errors.some((e) => e.includes('sin ordenar'))).toBe(true);
    expect(errors.some((e) => e.includes('fuera de 0–127'))).toBe(true);
  });

  it('acepta pedal con valores intermedios (medio pedal, B-004)', () => {
    const track = createTrack(
      {
        pedals: [0, 32, 64, 96, 127, 50].map((value, i) => ({
          kind: 'sustain' as const,
          time: i * 0.1,
          value,
        })),
      },
      seqId,
    );
    expect(validateTrack(track)).toEqual([]);
  });

  it('createTake usa 61 teclas, sin tempo ni medios, y calcula la duración', () => {
    const track = createTrack(
      { notes: [note(60, 0, 4)], pedals: [{ kind: 'sustain', time: 5, value: 0 }] },
      seqId,
    );
    const take = createTake({ title: 'Consuelo', tracks: [track] }, seqId, fixedNow);
    expect(take).toMatchObject({
      title: 'Consuelo',
      createdAt: '2026-11-16T12:00:00.000Z',
      duration: 5,
      tempoMap: [],
      media: [],
      keyboardRange: KEYBOARD_61,
    });
    expect(take.keyboardRange).not.toBe(KEYBOARD_61);
    expect(validateTake(take)).toEqual([]);
  });

  it('el id de la toma siempre es nuevo', () => {
    const take = createTake({ title: 'x' }, seqId, fixedNow);
    expect(take.id).toMatch(/^id-/);
    expect(takeEnd([])).toBe(0);
    expect(take.duration).toBe(0);
  });

  it('acepta tempo variable y rechaza bpm no positivos', () => {
    const take = createTake(
      {
        title: 'rubato',
        tempoMap: [
          { time: 0, bpm: 72 },
          { time: 10, bpm: 60 },
          { time: 20, bpm: 84.5 },
        ],
      },
      seqId,
      fixedNow,
    );
    expect(validateTake(take)).toEqual([]);
    expect(validateTake({ ...take, tempoMap: [{ time: 0, bpm: 0 }] })).toHaveLength(1);
  });

  it('rechaza rangos de teclado invertidos', () => {
    const take = createTake({ title: 'x', keyboardRange: { low: 96, high: 36 } }, seqId, fixedNow);
    expect(validateTake(take)).toHaveLength(1);
  });
});
