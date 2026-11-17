import { describe, expect, it } from 'vitest';
import { beatAt, beatGrid, tempoAt } from './meter';

describe('cuadrícula de compases', () => {
  it('4/4 a 120: un pulso cada 0,5 s y compás cada 4', () => {
    const grid = beatGrid([{ time: 0, bpm: 120 }], [4, 4], 4);
    expect(grid.map((b) => b.time)).toEqual([0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4]);
    expect(grid.map((b) => `${b.bar}.${b.beat}`)).toEqual([
      '1.1',
      '1.2',
      '1.3',
      '1.4',
      '2.1',
      '2.2',
      '2.3',
      '2.4',
      '3.1',
    ]);
  });

  it('3/4 y 6/8 (el pulso es la corchea)', () => {
    expect(beatGrid([{ time: 0, bpm: 60 }], [3, 4], 3).map((b) => b.beat)).toEqual([1, 2, 3, 1]);
    const six = beatGrid([{ time: 0, bpm: 60 }], [6, 8], 3);
    expect(six[1]!.time).toBeCloseTo(0.5, 10);
    expect(six[6]).toMatchObject({ bar: 2, beat: 1, time: 3 });
  });

  it('respeta un cambio de tempo a mitad de un pulso', () => {
    // 60 bpm (1 s por pulso) hasta 1,5 s; luego 120 bpm (0,5 s por pulso).
    const grid = beatGrid(
      [
        { time: 0, bpm: 60 },
        { time: 1.5, bpm: 120 },
      ],
      [4, 4],
      3,
    );
    expect(grid.map((b) => b.time)).toEqual([0, 1, 1.75, 2.25, 2.75]);
  });

  it('si el tempo empieza tarde, se usa desde 0; sin tempo no hay cuadrícula', () => {
    expect(beatGrid([{ time: 2, bpm: 60 }], [4, 4], 1).map((b) => b.time)).toEqual([0, 1]);
    expect(beatGrid([], [4, 4], 10)).toEqual([]);
    expect(beatGrid([{ time: 0, bpm: 120 }], undefined, 1)).toHaveLength(3);
  });

  it('pulso y tempo actuales', () => {
    const map = [
      { time: 0, bpm: 120 },
      { time: 2, bpm: 90 },
    ];
    const grid = beatGrid(map, [4, 4], 4);
    expect(beatAt(grid, 0.74)).toMatchObject({ bar: 1, beat: 2 });
    expect(beatAt(grid, 2)).toMatchObject({ bar: 2, beat: 1 });
    expect(beatAt([], 1)).toBeNull();
    expect(tempoAt(map, 1)).toBe(120);
    expect(tempoAt(map, 3)).toBe(90);
    expect(tempoAt([], 3)).toBeNull();
  });
});
