import { createNoteEvent } from '@impromptu/core';
import type { Beat } from '@impromptu/core';
import { describe, expect, it } from 'vitest';
import { rasgueos } from './rasgueo';

/** Una nota en una cuerda (6 = la más grave) que empieza en `start`. */
const nota = (string: number, start: number) => {
  const n = createNoteEvent({
    pitch: 40 + (6 - string) * 5,
    start,
    end: start + 0.4,
    velocity: 90,
    origin: 'midi-file',
  });
  n.string = string;
  n.fret = 0;
  return n;
};

const pulsos: Beat[] = [0, 0.5, 1, 1.5, 2].map((time, i) => ({ time, bar: 1, beat: (i % 4) + 1 }));

describe('rasgueo de guitarra', () => {
  it('las graves primero es hacia abajo; las agudas primero, hacia arriba', () => {
    const abajo = [6, 5, 4, 3, 2, 1].map((c, i) => nota(c, 1 + i * 0.008));
    const arriba = [1, 2, 3, 4].map((c, i) => nota(c, 2 + i * 0.01));
    const r = rasgueos([...abajo, ...arriba]);
    expect(r.map((x) => x.dir)).toEqual(['abajo', 'arriba']);
    expect(r[0]!.ids).toHaveLength(6);
  });

  it('acordes a la vez: en el pulso abajo, entre pulsos arriba', () => {
    const acorde = (t: number) => [4, 3, 2].map((c) => nota(c, t));
    const r = rasgueos([...acorde(0), ...acorde(0.25), ...acorde(0.5), ...acorde(0.75)], pulsos);
    expect(r.map((x) => x.dir)).toEqual(['abajo', 'arriba', 'abajo', 'arriba']);
  });

  it('notas sueltas o de dos cuerdas no son rasgueo', () => {
    expect(rasgueos([nota(6, 0), nota(5, 0.5), nota(4, 1), nota(3, 1)])).toHaveLength(0);
  });
});
