import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { importMidi } from '@impromptu/midi';
import { createNoteEvent } from '@impromptu/core';
import type { NoteEvent } from '@impromptu/core';
import { describe, expect, it } from 'vitest';
import { suggestFingering, transitionCost } from './fingering';
import { separateHands } from './hands';

let n = 0;
const note = (pitch: number, start: number, length = 0.4, extra: Partial<NoteEvent> = {}) =>
  createNoteEvent(
    { pitch, start, end: start + length, velocity: 80, origin: 'edit', ...extra },
    () => `n${++n}`,
  );
const melody = (pitches: number[], step = 0.5) => pitches.map((p, i) => note(p, i * step));
const fingers = (notes: NoteEvent[]) =>
  [...notes].sort((a, b) => a.start - b.start || a.pitch - b.pitch).map((x) => x.finger);

describe('separación de manos', () => {
  it('bajo abajo con la izquierda y melodía arriba con la derecha', () => {
    const notes = [
      ...[36, 43, 48, 43].map((p, i) => note(p, i * 0.5)),
      ...[72, 74, 76, 79].map((p, i) => note(p, i * 0.5)),
    ];
    const out = separateHands(notes);
    for (const x of out) expect(x.hand).toBe(x.pitch < 60 ? 'L' : 'R');
    expect(out.every((x) => x.handSource === 'auto')).toBe(true);
  });

  it('un acorde muy abierto se reparte entre las dos manos', () => {
    const out = separateHands([note(40, 0), note(47, 0), note(64, 0), note(67, 0), note(72, 0)]);
    const byPitch = new Map(out.map((x) => [x.pitch, x.hand]));
    expect(byPitch.get(40)).toBe('L');
    expect(byPitch.get(47)).toBe('L');
    expect(byPitch.get(72)).toBe('R');
    const left = out.filter((x) => x.hand === 'L').map((x) => x.pitch);
    expect(Math.max(...left) - Math.min(...left)).toBeLessThanOrEqual(14);
  });

  it('sigue la continuidad: una melodía que baja del Do central sigue en la derecha', () => {
    const out = separateHands(melody([67, 65, 64, 62, 60, 59, 57]));
    expect(out.every((x) => x.hand === 'R')).toBe(true);
  });

  it('no toca las manos que fijó el usuario', () => {
    const fixed = note(76, 0, 0.4, { hand: 'L', handSource: 'user' });
    const out = separateHands([fixed, note(40, 0)]);
    expect(out.find((x) => x.id === fixed.id)).toMatchObject({ hand: 'L', handSource: 'user' });
  });
});

describe('digitación', () => {
  it('cinco dedos en posición: Do Re Mi Fa Sol → 1 2 3 4 5 (derecha)', () => {
    expect(fingers(suggestFingering(melody([60, 62, 64, 65, 67]), 'R'))).toEqual([1, 2, 3, 4, 5]);
  });

  it('la izquierda subiendo Do Re Mi Fa Sol → 5 4 3 2 1', () => {
    expect(fingers(suggestFingering(melody([48, 50, 52, 53, 55]), 'L'))).toEqual([5, 4, 3, 2, 1]);
  });

  it('escala de Do de una octava: pasa el pulgar y termina en 5, sin repetir dedo', () => {
    const f = fingers(suggestFingering(melody([60, 62, 64, 65, 67, 69, 71, 72]), 'R'));
    expect(f[0]).toBe(1);
    expect(f[f.length - 1]).toBe(5);
    expect(f.filter((x) => x === 1).length).toBeGreaterThanOrEqual(2); // pulgar por debajo
    f.slice(1).forEach((x, i) => expect(x).not.toBe(f[i]));
  });

  it('un acorde de Do mayor en la derecha usa 1 3 5', () => {
    const chord = [note(60, 0), note(64, 0), note(67, 0)];
    expect(fingers(suggestFingering(chord, 'R'))).toEqual([1, 3, 5]);
  });

  it('respeta un dedo fijado por el usuario y recalcula alrededor', () => {
    const notes = melody([60, 62, 64, 65, 67]);
    notes[2] = { ...notes[2]!, finger: 1, fingerSource: 'user' };
    const out = suggestFingering(notes, 'R');
    expect(fingers(out)[2]).toBe(1);
    expect(out[2]!.fingerSource).toBe('user');
  });

  it('una mano grande alcanza saltos más amplios con menos costo', () => {
    expect(transitionCost(1, 60, 5, 74, 'R', 'large')).toBeLessThan(
      transitionCost(1, 60, 5, 74, 'R', 'small'),
    );
    expect(transitionCost(2, 60, 3, 75, 'R')).toBeGreaterThanOrEqual(1000);
  });
});

// Piezas reales de Jacobo (fuera de git, P11): en CI se saltan.

const fixtures = fileURLToPath(new URL('../../../fixtures/jacobo/', import.meta.url));
describe.skipIf(!existsSync(fixtures))('piezas reales de Jacobo', () => {
  for (const file of ['consuelo.mid', 'nostalgia.mid', 'still-learning.mid']) {
    it(`${file}: todas las notas con mano y dedo, en menos de 1 s`, () => {
      const notes = importMidi(readFileSync(fixtures + file)).take.tracks.flatMap((t) => t.notes);
      const t0 = performance.now();
      const withHands = separateHands(notes);
      const out = (['L', 'R'] as const).flatMap((h) =>
        suggestFingering(
          withHands.filter((x) => x.hand === h),
          h,
        ),
      );
      const ms = performance.now() - t0;
      expect(out).toHaveLength(notes.length);
      expect(out.every((x) => x.hand && x.finger)).toBe(true);
      expect(out.some((x) => x.hand === 'L')).toBe(true);
      expect(out.some((x) => x.hand === 'R')).toBe(true);
      expect(ms).toBeLessThan(1000);
    });
  }
});
