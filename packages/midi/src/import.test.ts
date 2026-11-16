import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { writeMidi } from 'midi-file';
import type { MidiEvent } from 'midi-file';
import { describe, expect, it } from 'vitest';
import { validateTake } from '@impromptu/core';
import { importMidi } from './import';

const PPQ = 480;
let n = 0;
const ids = () => `id-${++n}`;

type E = Omit<MidiEvent, 'deltaTime'> & { deltaTime?: number };
/** Arma un .mid en memoria a partir de pistas de eventos con deltaTime en ticks. */
function mid(tracks: E[][], opts: { running?: boolean } = {}): Uint8Array {
  const data = {
    header: { format: 1 as const, numTracks: tracks.length, ticksPerBeat: PPQ },
    tracks: tracks.map((t) => [
      ...t.map((e) => ({ deltaTime: 0, ...e }) as MidiEvent),
      { deltaTime: 0, meta: true, type: 'endOfTrack' } as MidiEvent,
    ]),
  };
  return Uint8Array.from(writeMidi(data, opts));
}
const on = (noteNumber: number, deltaTime = 0, velocity = 90, channel = 0): E =>
  ({ type: 'noteOn', channel, noteNumber, velocity, deltaTime }) as E;
const off = (noteNumber: number, deltaTime = 0, channel = 0): E =>
  ({ type: 'noteOff', channel, noteNumber, velocity: 0, deltaTime }) as E;
const cc = (controllerType: number, value: number, deltaTime = 0): E =>
  ({ type: 'controller', channel: 0, controllerType, value, deltaTime }) as E;
const tempo = (bpm: number, deltaTime = 0): E =>
  ({
    meta: true,
    type: 'setTempo',
    microsecondsPerBeat: Math.round(60_000_000 / bpm),
    deltaTime,
  }) as E;
const name = (text: string): E => ({ meta: true, type: 'trackName', text }) as E;

const imp = (bytes: Uint8Array, dedupeTracks?: boolean) =>
  importMidi(bytes, { newId: ids, now: () => new Date(0), dedupeTracks });

describe('importMidi', () => {
  it('lee notas, fuerza y nombre de pista a 120 bpm por defecto', () => {
    const { take, warnings } = imp(
      mid([[name('Piano'), on(60), off(60, PPQ), on(64, 0, 40), off(64, PPQ * 2)]]),
    );
    expect(warnings).toEqual([]);
    const notes = take.tracks[0]!.notes;
    expect(take.tracks[0]!.name).toBe('Piano');
    expect(notes.map((x) => [x.pitch, x.start, x.end, x.velocity])).toEqual([
      [60, 0, 0.5, 90],
      [64, 0.5, 1.5, 40],
    ]);
    expect(
      notes.every((x) => x.hand === null && x.finger === null && x.origin === 'midi-file'),
    ).toBe(true);
    expect(take.duration).toBe(1.5);
    expect(validateTake(take)).toEqual([]);
  });

  it('note-on con velocity 0 es un note-off (B-001), también con running status', () => {
    const bytes = mid([[on(60), on(60, PPQ, 0), on(62), on(62, PPQ, 0)]], { running: true });
    const notes = imp(bytes).take.tracks[0]!.notes;
    expect(notes.map((x) => [x.pitch, x.start, x.end])).toEqual([
      [60, 0, 0.5],
      [62, 0.5, 1],
    ]);
  });

  it('cierra notas sin note-off al final de la pista y avisa (B-002)', () => {
    const { take, warnings } = imp(
      mid([[name('Mano'), on(60), on(67, PPQ), off(67, PPQ), cc(64, 0, PPQ)]]),
    );
    const c4 = take.tracks[0]!.notes.find((x) => x.pitch === 60)!;
    expect(c4.end).toBe(1.5);
    expect(warnings).toContainEqual({ code: 'unclosed-notes', track: 'Mano', count: 1 });
  });

  it('empareja repeticiones de la misma tecla en orden (FIFO)', () => {
    const notes = imp(mid([[on(60), on(60, PPQ), off(60, PPQ), off(60, PPQ)]])).take.tracks[0]!
      .notes;
    expect(notes.map((x) => [x.start, x.end])).toEqual([
      [0, 1],
      [0.5, 1.5],
    ]);
  });

  it('respeta cambios de tempo en cualquier pista', () => {
    const { take } = imp(
      mid([
        [tempo(120), tempo(60, PPQ)], // un pulso a 120 y luego a 60
        [on(60), off(60, PPQ), on(62), off(62, PPQ)],
      ]),
    );
    expect(take.tracks[0]!.notes.map((x) => [x.start, x.end])).toEqual([
      [0, 0.5],
      [0.5, 1.5],
    ]);
    expect(take.tempoMap).toEqual([
      { time: 0, bpm: 120 },
      { time: 0.5, bpm: 60 },
    ]);
  });

  it('guarda el pedal con su valor completo y aplica una pista solo de pedal (B-004)', () => {
    const { take } = imp(
      mid([
        [
          name('MIDI'),
          cc(64, 127),
          cc(64, 70, PPQ),
          cc(66, 127),
          cc(67, 100),
          cc(7, 100),
          cc(64, 0, PPQ),
        ],
        [name('Piano'), on(60), off(60, PPQ * 3)],
      ]),
    );
    expect(take.tracks).toHaveLength(1);
    expect(take.tracks[0]!.pedals).toEqual([
      { kind: 'sustain', time: 0, value: 127 },
      { kind: 'sustain', time: 0.5, value: 70 },
      { kind: 'sostenuto', time: 0.5, value: 127 },
      { kind: 'soft', time: 0.5, value: 100 },
      { kind: 'sustain', time: 1, value: 0 },
    ]);
  });

  it('quita pistas duplicadas (como Nostalgia, doblada en dos instrumentos)', () => {
    const part = [on(60), off(60, PPQ), on(64), off(64, PPQ)];
    const bytes = mid([
      [name('DSK The Grand'), ...part],
      [name('LABS'), ...part],
    ]);
    const { take, warnings } = imp(bytes);
    expect(take.tracks.map((t) => t.name)).toEqual(['DSK The Grand']);
    expect(warnings).toContainEqual({
      code: 'duplicate-track-removed',
      track: 'LABS',
      duplicateOf: 'DSK The Grand',
    });
    expect(imp(bytes, false).take.tracks).toHaveLength(2);
  });

  it('una copia cuantizada cuenta como duplicada; una parte distinta no', () => {
    const live = [on(60), off(60, 230), on(64, 14), off(64, 236)];
    const quantized = [on(60), off(60, PPQ / 2), on(64), off(64, PPQ / 2)];
    const other = [on(60), off(60, PPQ / 2), on(65), off(65, PPQ / 2)];
    expect(imp(mid([live, quantized])).take.tracks).toHaveLength(1);
    expect(imp(mid([live, other])).take.tracks).toHaveLength(2);
  });

  it('lee compás y armadura, y marca batería en el canal 10', () => {
    const { take } = imp(
      mid([
        [
          {
            meta: true,
            type: 'timeSignature',
            numerator: 3,
            denominator: 4,
            metronome: 24,
            thirtyseconds: 8,
          } as E,
          { meta: true, type: 'keySignature', key: -3, scale: 0 } as E,
        ],
        [on(36, 0, 100, 9), off(36, PPQ, 9)],
      ]),
    );
    expect(take.timeSignature).toEqual([3, 4]);
    expect(take.keySignature).toBe('Eb major');
    expect(take.tracks[0]!.instrument).toBe('drums');
  });

  it('avisa si el archivo no tiene notas', () => {
    expect(imp(mid([[tempo(90)]])).warnings).toContainEqual({ code: 'no-notes' });
  });
});

// Grabaciones reales de Jacobo (fuera de git, P11): en CI no existen y se saltan.
const fixtures = fileURLToPath(new URL('../../../fixtures/jacobo/', import.meta.url));
const real = (file: string) => importMidi(readFileSync(fixtures + file), { title: file });

describe.skipIf(!existsSync(fixtures))('MIDIs reales de Jacobo', () => {
  it('Consuelo: 826 notas, todas cerradas con velocity 0', () => {
    const { take, warnings } = real('consuelo.mid');
    expect(take.tracks).toHaveLength(1);
    expect(take.tracks[0]!.notes).toHaveLength(826);
    expect(warnings.filter((w) => w.code === 'unclosed-notes')).toEqual([]);
    expect(validateTake(take)).toEqual([]);
  });

  it('Nostalgia: quita la pista doblada y usa 76 teclas porque baja a la 35', () => {
    const { take, warnings } = real('nostalgia.mid');
    expect(take.tracks).toHaveLength(1);
    expect(take.tracks[0]!.notes).toHaveLength(842);
    expect(warnings.some((w) => w.code === 'duplicate-track-removed')).toBe(true);
    expect(take.keyboardRange).toEqual({ low: 28, high: 103 });
    expect(validateTake(take)).toEqual([]);
  });

  it('Sorry, I filed you: el pedal de su pista aparte llega a la pista del piano', () => {
    const { take } = real('sorry-i-filed-you.mid');
    expect(take.tracks).toHaveLength(1);
    expect(take.tracks[0]!.notes).toHaveLength(1266);
    expect(take.tracks[0]!.pedals).toHaveLength(8);
    expect(validateTake(take)).toEqual([]);
  });

  it('I am still learning: formato 0 con pedal', () => {
    const { take } = real('still-learning.mid');
    expect(take.tracks[0]!.notes).toHaveLength(476);
    expect(take.tracks[0]!.pedals.filter((p) => p.kind === 'sustain')).toHaveLength(18);
    expect(validateTake(take)).toEqual([]);
  });
});
