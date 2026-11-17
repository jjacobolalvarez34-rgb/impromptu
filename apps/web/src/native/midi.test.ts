import { describe, expect, it } from 'vitest';
import { splitMidi } from './midi';

describe('separar mensajes MIDI del puente de Android', () => {
  it('separa notas, usa estado continuo y descarta sistema exclusivo', () => {
    const running = { status: 0 };
    expect(splitMidi([0x90, 60, 100, 64, 90, 0xfe, 0x80, 60, 0], running)).toEqual([
      [0x90, 60, 100],
      [0x90, 64, 90],
      [0xfe],
      [0x80, 60, 0],
    ]);
    expect(splitMidi([0xf0, 1, 2, 3, 0xf7, 0xb0, 64, 127, 0xc0, 5], running)).toEqual([
      [0xb0, 64, 127],
      [0xc0, 5],
    ]);
  });
});
