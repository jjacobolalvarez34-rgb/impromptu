import { createNoteEvent } from '@impromptu/core';
import { describe, expect, it } from 'vitest';
import { WaitMode, practiceChords } from './wait';

const note = (pitch: number, start: number, hand: 'L' | 'R') => {
  const n = createNoteEvent({ pitch, start, end: start + 0.4, velocity: 80, origin: 'midi-file' });
  n.hand = hand;
  return n;
};

const notes = [
  note(60, 0, 'R'),
  note(64, 0.02, 'R'),
  note(48, 0, 'L'),
  note(62, 0.5, 'R'),
  note(43, 0.5, 'L'),
  note(64, 1, 'R'),
];

describe('modo espera', () => {
  it('agrupa acordes de la mano elegida', () => {
    expect(practiceChords(notes, 'R').map((c) => c.pitches)).toEqual([[60, 64], [62], [64]]);
    expect(practiceChords(notes, 'L').map((c) => c.pitches)).toEqual([[48], [43]]);
    expect(practiceChords(notes, 'both')[0]!.pitches.sort()).toEqual([48, 60, 64]);
    expect(practiceChords(notes, 'R', 0.4, 0.9).map((c) => c.time)).toEqual([0.5]);
  });

  it('avanza al completar el acorde, en cualquier orden, y cuenta errores', () => {
    const w = new WaitMode(practiceChords(notes, 'R'));
    expect(w.press(64)).toBe(false);
    expect(w.missing).toEqual([60]);
    expect(w.press(61)).toBe(false); // equivocada
    expect(w.press(60)).toBe(true);
    expect(w.press(62)).toBe(true);
    expect(w.current?.time).toBe(1);
    expect(w.stats).toEqual({ done: 2, clean: 1, wrong: 1 });
    expect(w.accuracy).toBe(0.5);
  });

  it('al repetir una sección vuelve al acorde de ese momento', () => {
    const w = new WaitMode(practiceChords(notes, 'R'));
    w.press(60);
    w.seek(0.5);
    expect(w.current?.pitches).toEqual([62]);
    expect(w.missing).toEqual([62]);
  });
});
