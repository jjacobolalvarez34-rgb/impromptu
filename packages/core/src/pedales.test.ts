import { describe, expect, it } from 'vitest';
import { conTramos, editarPedal, limpiarTramos, tramosDePedal } from './pedales';
import { createTake, createTrack } from './factory';
import type { PedalEvent } from './model';

const s = (time: number, value: number): PedalEvent => ({ kind: 'sustain', time, value });

describe('editar el pedal (pedido 58)', () => {
  it('lee los tramos pisados, con medio pedal y uno que no se suelta', () => {
    const pedals = [s(1, 127), s(2, 0), s(3, 70), s(4, 30), s(5, 127)];
    expect(tramosDePedal(pedals, 'sustain')).toEqual([
      { desde: 1, hasta: 2 },
      { desde: 3, hasta: 4 },
      { desde: 5, hasta: Infinity },
    ]);
  });

  it('une los tramos que se pisan y quita los vacíos', () => {
    expect(
      limpiarTramos([
        { desde: 3, hasta: 5 },
        { desde: 1, hasta: 2 },
        { desde: 4, hasta: 6 },
        { desde: 7, hasta: 7 },
        { desde: 9, hasta: 8 },
      ]),
    ).toEqual([
      { desde: 1, hasta: 2 },
      { desde: 3, hasta: 6 },
      { desde: 8, hasta: 9 },
    ]);
  });

  it('reescribe solo el pedal editado', () => {
    const una: PedalEvent = { kind: 'soft', time: 0.5, value: 127 };
    const res = conTramos([una, s(1, 127), s(2, 0)], 'sustain', [{ desde: 3, hasta: 4 }]);
    expect(res).toEqual([una, s(3, 127), s(4, 0)]);
  });

  it('borrar, crear y alargar un pedal en la toma', () => {
    const take = createTake({
      title: 'x',
      tracks: [createTrack({ pedals: [s(1, 127), s(2, 0), s(3, 127), s(4, 0)] })],
    });
    const sinPrimero = editarPedal(take, 'sustain', (t) => t.slice(1));
    expect(tramosDePedal(sinPrimero.tracks[0]!.pedals, 'sustain')).toEqual([
      { desde: 3, hasta: 4 },
    ]);
    const conNuevo = editarPedal(sinPrimero, 'sustain', (t) => [...t, { desde: 5, hasta: 6 }]);
    expect(tramosDePedal(conNuevo.tracks[0]!.pedals, 'sustain')).toHaveLength(2);
    const alargado = editarPedal(conNuevo, 'sustain', (t) =>
      t.map((x, i) => (i === 0 ? { ...x, hasta: 5.5 } : x)),
    );
    // Al alargar el primero hasta el segundo, se unen.
    expect(tramosDePedal(alargado.tracks[0]!.pedals, 'sustain')).toEqual([{ desde: 3, hasta: 6 }]);
  });
});
