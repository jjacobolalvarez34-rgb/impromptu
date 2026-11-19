import { createNoteEvent, createTake, createTrack } from '@impromptu/core';
import type { Instrument, Take } from '@impromptu/core';
import { describe, expect, it } from 'vitest';
import { editar } from './editor';
import type { Seleccion } from './editor';
import { DIV, buildScore } from './score';
import { beatsOf } from './tempo';

/** Do, mi, sol, do en negras a 120 (una negra = 0,5 s). */
function toma(instrument: Instrument = 'piano', pitches = [60, 64, 67, 72]): Take {
  const notes = pitches.map((pitch, i) =>
    createNoteEvent({ pitch, start: i * 0.5, end: i * 0.5 + 0.48, velocity: 90, origin: 'edit' }),
  );
  return createTake({
    title: 'Prueba',
    tracks: [createTrack({ instrument, notes })],
    tempoMap: [{ time: 0, bpm: 120 }],
    timeSignature: [4, 4],
  });
}

const partitura = (t: Take, instrument: Instrument = 'piano') =>
  buildScore(t, { beats: beatsOf(t), instrument });
const sel = (inicio: number, tecla: number | null, pentagrama: 0 | 1 = 0): Seleccion => ({
  compas: 0,
  pentagrama,
  inicio,
  duracion: DIV,
  tecla,
});
const notas = (t: Take) => t.tracks.flatMap((x) => x.notes);

describe('editor de partitura', () => {
  it('sube una nota medio tono y conserva la pieza (id y título)', () => {
    const t = toma();
    const r = editar(t, partitura(t), sel(DIV, 64), { tipo: 'altura', semitonos: 1 });
    expect(r.take.id).toBe(t.id);
    expect(notas(r.take).map((n) => n.pitch)).toEqual([60, 65, 67, 72]);
    expect(r.seleccion?.tecla).toBe(65);
  });

  it('cambia la figura: la blanca pisa la nota siguiente', () => {
    const t = toma();
    const r = editar(t, partitura(t), sel(0, 60), { tipo: 'figura', divisiones: DIV * 2 });
    const ns = notas(r.take);
    expect(ns.map((n) => n.pitch)).toEqual([60, 67, 72]);
    expect(ns[0]!.end).toBeCloseTo(1);
  });

  it('borra una nota y pone otra en el silencio', () => {
    const t = toma();
    const borrada = editar(t, partitura(t), sel(DIV, 64), { tipo: 'borrar' });
    expect(notas(borrada.take).map((n) => n.pitch)).toEqual([60, 67, 72]);
    const puesta = editar(borrada.take, partitura(borrada.take), sel(DIV, null), { tipo: 'poner' });
    expect(notas(puesta.take)).toHaveLength(4);
  });

  it('pasa una nota a la mano izquierda', () => {
    const t = toma();
    const r = editar(t, partitura(t), sel(DIV * 2, 67), { tipo: 'mano' });
    expect(notas(r.take).find((n) => n.pitch === 67)!.hand).toBe('L');
  });

  it('guitarra: la misma nota en otra cuerda', () => {
    const t = toma('guitar', [64]);
    const antes = editar(
      t,
      partitura(t, 'guitar'),
      sel(0, 64),
      { tipo: 'figura', divisiones: DIV },
      'guitar',
    );
    const cuerda = notas(antes.take)[0]!.string;
    const r = editar(
      antes.take,
      partitura(antes.take, 'guitar'),
      sel(0, 64),
      { tipo: 'cuerda', delta: 1 },
      'guitar',
    );
    const n = notas(r.take)[0]!;
    expect(n.pitch).toBe(64);
    expect(n.string).not.toBe(cuerda);
  });

  it('batería: subir pasa a otra pieza del kit', () => {
    const t = toma('drums', [36]);
    const r = editar(
      t,
      partitura(t, 'drums'),
      sel(0, 36),
      { tipo: 'altura', semitonos: 1 },
      'drums',
    );
    expect(notas(r.take)[0]!.pitch).toBe(43);
  });
});
