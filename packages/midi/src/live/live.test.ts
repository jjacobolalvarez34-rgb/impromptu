import { validateTake } from '@impromptu/core';
import { describe, expect, it } from 'vitest';
import { normalizeMessage } from './normalize';
import { GENERIC_PROFILE, profileFor } from './profiles';
import { Recorder } from './recorder';

describe('normalizeMessage', () => {
  it('note-on y note-off, con el tiempo del evento en segundos (B-007)', () => {
    expect(normalizeMessage([0x90, 60, 100], 1500)).toEqual({
      type: 'noteon',
      pitch: 60,
      velocity: 100,
      channel: 0,
      time: 1.5,
    });
    expect(normalizeMessage([0x81, 60, 64], 2000)).toEqual({
      type: 'noteoff',
      pitch: 60,
      channel: 1,
      time: 2,
    });
  });

  it('note-on con velocity 0 es note-off (B-001)', () => {
    expect(normalizeMessage([0x90, 60, 0], 0)?.type).toBe('noteoff');
  });

  it('ignora active sensing, clock y demás mensajes de sistema (B-003)', () => {
    for (const status of [0xfe, 0xf8, 0xfa, 0xfc, 0xf0]) {
      expect(normalizeMessage([status], 0)).toBeNull();
    }
    expect(normalizeMessage([], 0)).toBeNull();
    expect(normalizeMessage([0x40, 1], 0)).toBeNull(); // byte de datos suelto
  });

  it('pedales CC64/66/67 con valor completo (B-004); otros CC se ignoran', () => {
    expect(normalizeMessage([0xb0, 64, 37], 0)).toEqual({
      type: 'pedal',
      kind: 'sustain',
      value: 37,
      channel: 0,
      time: 0,
    });
    expect(normalizeMessage([0xb0, 66, 127], 0)).toMatchObject({ kind: 'sostenuto' });
    expect(normalizeMessage([0xb0, 67, 127], 0)).toMatchObject({ kind: 'soft' });
    expect(normalizeMessage([0xb0, 7, 100], 0)).toBeNull();
    expect(normalizeMessage([0xe0, 0, 64], 0)).toBeNull(); // pitch bend
  });

  it('el perfil puede invertir el pedal (B-005) y ajustar la curva de velocity', () => {
    const inverted = { ...GENERIC_PROFILE, invertPedal: true };
    expect(normalizeMessage([0xb0, 64, 0], 0, inverted)).toMatchObject({ value: 127 });
    const easy = { ...GENERIC_PROFILE, velocityCurve: 2 };
    const v = normalizeMessage([0x90, 60, 32], 0, easy);
    expect(v?.type === 'noteon' && v.velocity).toBeGreaterThan(32);
  });
});

describe('perfiles', () => {
  it('reconoce el PSR-E343 por nombre o como "Digital Keyboard" de Yamaha', () => {
    expect(profileFor('PSR-E343').id).toBe('yamaha-psr-e343');
    expect(profileFor('Digital Keyboard', 'Yamaha Corporation').id).toBe('yamaha-psr-e343');
    expect(profileFor('Digital Keyboard', 'Casio').id).toBe('generic');
    expect(profileFor('Launchkey 49').id).toBe('generic');
  });
});

describe('Recorder', () => {
  const ids = (() => {
    let n = 0;
    return () => `r${++n}`;
  })();
  const on = (pitch: number, time: number, velocity = 90) =>
    ({ type: 'noteon', pitch, velocity, channel: 0, time }) as const;
  const off = (pitch: number, time: number) =>
    ({ type: 'noteoff', pitch, channel: 0, time }) as const;

  it('graba notas y pedal relativos al inicio y cierra las abiertas al parar (B-002)', () => {
    const rec = new Recorder(ids);
    rec.start(100);
    rec.push(on(60, 100.5));
    rec.push({ type: 'pedal', kind: 'sustain', value: 127, channel: 0, time: 100.6 });
    rec.push(on(64, 101));
    rec.push(off(60, 101.5));
    expect(rec.openNotes()).toEqual([{ pitch: 64, velocity: 90, start: 1 }]);
    expect(rec.closedNotes()).toHaveLength(1);

    const take = rec.stop(103, 'Improvisación', { name: 'PSR-E343' });
    const notes = take.tracks[0]!.notes;
    expect(notes.map((n) => [n.pitch, n.start, n.end, n.origin])).toEqual([
      [60, 0.5, 1.5, 'midi-live'],
      [64, 1, 3, 'midi-live'],
    ]);
    expect(take.tracks[0]!.pedals).toEqual([{ kind: 'sustain', time: 0.6, value: 127 }]);
    expect(take.duration).toBe(3);
    expect(take.device).toEqual({ name: 'PSR-E343' });
    expect(notes.every((n) => n.hand === null && n.finger === null)).toBe(true);
    expect(validateTake(take)).toEqual([]);
  });

  it('eventos anteriores al inicio quedan en 0 y empezar de nuevo limpia todo', () => {
    const rec = new Recorder(ids);
    rec.start(10);
    rec.push(on(60, 9.9));
    rec.push(off(60, 10.2));
    expect(rec.closedNotes()[0]!.start).toBe(0);
    rec.start(20);
    expect(rec.closedNotes()).toHaveLength(0);
    expect(rec.openNotes()).toHaveLength(0);
  });
});
