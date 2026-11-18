import { describe, expect, it } from 'vitest';
import { createNoteEvent } from './factory';
import { AFINACIONES, asignarTrastes, posiciones } from './guitar';
import { PIEZAS_BATERIA, piezaDeNota } from './drums';

let id = 0;
const nota = (pitch: number, start: number) =>
  createNoteEvent(
    { pitch, start, end: start + 0.4, velocity: 80, origin: 'audio' },
    () => `n${id++}`,
  );

describe('guitarra', () => {
  it('el mi grave solo cabe al aire en la sexta cuerda', () => {
    expect(posiciones(40)).toEqual([{ string: 6, fret: 0 }]);
    // El mi agudo, en la sexta cuerda, caería en el traste 24: fuera del mástil de 22.
    expect(posiciones(64).map((p) => p.string)).toEqual([1, 2, 3, 4, 5]);
  });

  it('un acorde de mi mayor abierto sale en su forma de siempre', () => {
    // Mi mayor: 40 47 52 56 59 64 (cuerdas 6 a 1: 0 2 2 1 0 0).
    const acorde = [40, 47, 52, 56, 59, 64].map((p) => nota(p, 0));
    const r = asignarTrastes(acorde);
    expect(r.map((n) => [n.string, n.fret])).toEqual([
      [6, 0],
      [5, 2],
      [4, 2],
      [3, 1],
      [2, 0],
      [1, 0],
    ]);
  });

  it('una melodía no salta de un extremo al otro del mástil', () => {
    const melodia = [67, 69, 71, 72, 74].map((p, i) => nota(p, i * 0.5));
    // Las cuerdas al aire no mueven la mano: cuenta solo lo pisado.
    const trastes = asignarTrastes(melodia)
      .map((n) => n.fret!)
      .filter((f) => f > 0);
    expect(Math.max(...trastes) - Math.min(...trastes)).toBeLessThanOrEqual(5);
  });

  it('respeta la cuerda y el traste puestos a mano', () => {
    const n = { ...nota(64, 0), string: 2, fret: 5 };
    expect(asignarTrastes([n])[0]).toMatchObject({ string: 2, fret: 5 });
  });

  it('una nota fuera del rango queda sin cuerda', () => {
    expect(asignarTrastes([nota(30, 0)])[0]!.string).toBeUndefined();
    expect(AFINACIONES.bajo).toHaveLength(4);
  });
});

describe('batería', () => {
  it('reconoce las piezas del mapa General MIDI', () => {
    expect(piezaDeNota(36)!.id).toBe('bombo');
    expect(piezaDeNota(40)!.id).toBe('caja');
    expect(piezaDeNota(46)!.id).toBe('hihat');
    expect(piezaDeNota(60)).toBeNull();
    expect(new Set(PIEZAS_BATERIA.map((p) => p.id)).size).toBe(PIEZAS_BATERIA.length);
  });
});
