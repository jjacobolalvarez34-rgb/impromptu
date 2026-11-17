import { createNoteEvent, createTake, createTrack } from '@impromptu/core';
import type { NoteEvent } from '@impromptu/core';
import { describe, expect, it } from 'vitest';
import { exportMidi, secondsToTicks } from './export';
import { importMidi } from './import';

const note = (pitch: number, start: number, end: number, hand: 'L' | 'R' | null = null) => {
  const n = createNoteEvent({ pitch, start, end, velocity: 90, origin: 'audio' });
  n.hand = hand;
  return n;
};

const starts = (notes: NoteEvent[]) =>
  notes.map((n) => [n.pitch, +n.start.toFixed(3), +n.end.toFixed(3)]);

describe('exportar MIDI', () => {
  it('ida y vuelta: las notas y los pedales vuelven iguales (al milisegundo)', () => {
    const notes = [note(60, 0.5, 1.25), note(64, 0.5, 1.0), note(67, 1.333, 2.9)];
    const take = createTake({
      title: 'Prueba',
      tracks: [
        createTrack({
          name: 'Piano',
          notes,
          pedals: [
            { kind: 'sustain', time: 0.4, value: 127 },
            { kind: 'sustain', time: 2.0, value: 0 },
            { kind: 'soft', time: 1.0, value: 100 },
          ],
        }),
      ],
      duration: 3,
    });
    const back = importMidi(exportMidi(take)).take;
    const backNotes = back.tracks.flatMap((t) => t.notes);
    expect(starts(backNotes)).toEqual(starts(notes));
    expect(backNotes.map((n) => n.velocity)).toEqual([90, 90, 90]);
    const pedals = back.tracks.flatMap((t) => t.pedals);
    expect(pedals.map((p) => [p.kind, +p.time.toFixed(3), p.value])).toEqual([
      ['sustain', 0.4, 127],
      ['soft', 1, 100],
      ['sustain', 2, 0],
    ]);
  });

  it('con manos asignadas escribe una pista por mano', () => {
    const take = createTake({
      title: 'Manos',
      tracks: [createTrack({ name: 'Piano', notes: [note(48, 0, 1, 'L'), note(72, 0, 1, 'R')] })],
      duration: 1,
    });
    const back = importMidi(exportMidi(take), { dedupeTracks: false }).take;
    expect(back.tracks.map((t) => [t.name, t.notes.map((n) => n.pitch)])).toEqual([
      ['Mano derecha', [72]],
      ['Mano izquierda', [48]],
    ]);
  });

  it('respeta un cambio de tempo', () => {
    const ticks = secondsToTicks([
      { time: 0, bpm: 120 },
      { time: 2, bpm: 60 },
    ]);
    expect(ticks(1)).toBe(960); // 2 negras a 120
    expect(ticks(3)).toBe(1920 + 480); // 4 negras + 1 a 60
    const take = createTake({
      title: 'Tempo',
      tracks: [createTrack({ name: 'Piano', notes: [note(60, 2.5, 3.5)] })],
      tempoMap: [
        { time: 0, bpm: 120 },
        { time: 2, bpm: 60 },
      ],
      duration: 4,
    });
    const back = importMidi(exportMidi(take)).take;
    expect(starts(back.tracks[0]!.notes)).toEqual([[60, 2.5, 3.5]]);
  });
});
