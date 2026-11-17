import { createNoteEvent, createTake, createTrack, validateTake } from '@impromptu/core';
import { describe, expect, it } from 'vitest';
import {
  autoAssign,
  hasNoHands,
  removeNotes,
  resizeNotes,
  setFinger,
  setHand,
  shiftNotes,
  transposeNotes,
} from './edit';

let n = 0;
const ids = () => `e${++n}`;
function piece() {
  const notes = [
    ...[36, 43, 48].map((p, i) =>
      createNoteEvent(
        { pitch: p, start: i * 0.5, end: i * 0.5 + 0.4, velocity: 80, origin: 'midi-file' },
        ids,
      ),
    ),
    ...[72, 74, 76].map((p, i) =>
      createNoteEvent(
        { pitch: p, start: i * 0.5, end: i * 0.5 + 0.4, velocity: 80, origin: 'midi-file' },
        ids,
      ),
    ),
  ];
  return createTake({ title: 'x', tracks: [createTrack({ notes }, ids)] }, ids);
}
const notesOf = (t: ReturnType<typeof piece>) => t.tracks[0]!.notes;

describe('edición de tomas', () => {
  it('asigna manos y dedos a toda la toma', () => {
    const take = piece();
    expect(hasNoHands(take)).toBe(true);
    const out = autoAssign(take, 'medium');
    expect(hasNoHands(out)).toBe(false);
    expect(notesOf(out).every((x) => x.hand && x.finger)).toBe(true);
    expect(validateTake(out)).toEqual([]);
  });

  it('cambiar la mano la marca como del usuario y recalcula los dedos', () => {
    const take = autoAssign(piece(), 'medium');
    const target = notesOf(take).find((x) => x.pitch === 48)!;
    const out = setHand(take, new Set([target.id]), 'R', 'medium');
    const changed = notesOf(out).find((x) => x.id === target.id)!;
    expect(changed).toMatchObject({ hand: 'R', handSource: 'user' });
    expect(changed.finger).not.toBeNull();
  });

  it('fijar un dedo lo deja como ancla; null lo vuelve automático', () => {
    const take = autoAssign(piece(), 'medium');
    const target = notesOf(take).find((x) => x.pitch === 74)!;
    const fixed = setFinger(take, new Set([target.id]), 5, 'medium');
    expect(notesOf(fixed).find((x) => x.id === target.id)).toMatchObject({
      finger: 5,
      fingerSource: 'user',
    });
    const freed = setFinger(fixed, new Set([target.id]), null, 'medium');
    expect(notesOf(freed).find((x) => x.id === target.id)!.fingerSource).toBe('auto');
  });

  it('mover, alargar, transponer y borrar', () => {
    const take = piece();
    const first = notesOf(take)[0]!;
    const set = new Set([first.id]);
    expect(notesOf(shiftNotes(take, set, -5)).find((x) => x.id === first.id)!.start).toBe(0);
    expect(notesOf(shiftNotes(take, set, 0.25)).find((x) => x.id === first.id)!.start).toBe(0.25);
    expect(notesOf(resizeNotes(take, set, -10)).find((x) => x.id === first.id)!.end).toBeCloseTo(
      first.start + 0.03,
      6,
    );
    expect(notesOf(transposeNotes(take, set, 2)).find((x) => x.id === first.id)!.pitch).toBe(
      first.pitch + 2,
    );
    const removed = removeNotes(take, set);
    expect(notesOf(removed)).toHaveLength(notesOf(take).length - 1);
    expect(validateTake(removed)).toEqual([]);
  });
});
