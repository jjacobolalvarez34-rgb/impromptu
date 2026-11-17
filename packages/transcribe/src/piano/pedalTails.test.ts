import { describe, expect, it } from 'vitest';
import { trimPedalTails } from './pedalTails';

const n = (pitch: number, start: number, end: number) => ({ pitch, start, end, velocity: 80 });

describe('notas alargadas por el pedal', () => {
  it('la nota que suena hasta soltar el pedal se corta en la siguiente nota de su zona', () => {
    const notes = [n(48, 0, 4.05), n(52, 0.5, 4.0), n(55, 1, 4.02)];
    const out = trimPedalTails(notes, [{ start: 0, end: 4 }]);
    expect(out.map((x) => x.end)).toEqual([0.5, 1, 4.02]);
  });

  it('pisar otra vez el pedal también corta (cambio de armonía)', () => {
    const notes = [n(60, 0, 3.9), n(84 + 12, 1, 1.5)];
    const pedals = [
      { start: 0, end: 2 },
      { start: 2.1, end: 4 },
    ];
    // La nota 96 está lejos (más de una octava): el corte de la 60 lo da el pedal en 2,1 s.
    expect(trimPedalTails(notes, pedals)[0]!.end).toBeCloseTo(2.1, 5);
  });

  it('no toca notas sin pedal ni notas que terminan lejos de soltarlo', () => {
    const notes = [n(60, 0, 1), n(62, 1, 2)];
    expect(trimPedalTails(notes, [])).toEqual(notes);
    expect(trimPedalTails(notes, [{ start: 0, end: 5 }])).toEqual(notes);
  });

  it('nunca deja una nota más corta de 0,12 s', () => {
    const out = trimPedalTails([n(60, 0, 2), n(61, 0.12, 2)], [{ start: 0, end: 2 }]);
    expect(out[0]!.end).toBeCloseTo(0.12, 5);
  });
});
