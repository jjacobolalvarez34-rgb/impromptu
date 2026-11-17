import { createNoteEvent, createTake, createTrack } from '@impromptu/core';
import type { NoteEvent } from '@impromptu/core';
import { describe, expect, it } from 'vitest';
import {
  DIV,
  beatsOf,
  buildScore,
  estimateKey,
  quantizeOnsets,
  quantizedTake,
  splitFigures,
  toMusicXml,
} from './index';

const note = (pitch: number, start: number, end: number, hand: 'L' | 'R' | null = null) => {
  const n = createNoteEvent({ pitch, start, end, velocity: 90, origin: 'midi-live' });
  n.hand = hand;
  return n;
};

/** Toma con un mapa de tempo fijo (como un MIDI exportado de un DAW). */
const take = (notes: NoteEvent[], bpm = 120, pedals: { time: number; value: number }[] = []) =>
  createTake({
    title: 'Prueba & <partitura>',
    tracks: [
      createTrack({
        name: 'Piano',
        notes,
        pedals: pedals.map((p) => ({ kind: 'sustain' as const, ...p })),
      }),
    ],
    tempoMap: [{ time: 0, bpm }],
    timeSignature: [4, 4],
  });

/** Comprobación mínima de XML bien formado: etiquetas balanceadas. */
function balanced(xml: string): boolean {
  const stack: string[] = [];
  const body = xml.replace(/<\?xml[^>]*\?>/, '').replace(/<!DOCTYPE[^>]*>/, '');
  for (const m of body.matchAll(/<(\/?)([a-zA-Z-]+)[^>]*?(\/?)>/g)) {
    if (m[3]) continue; // <x/>
    if (m[1]) {
      if (stack.pop() !== m[2]) return false;
    } else stack.push(m[2]!);
  }
  return stack.length === 0;
}

describe('tempo y pulsos', () => {
  it('estima el tempo de una pieza tocada sin metrónomo (±3 %)', () => {
    // Negras a 96 BPM con pequeñas imprecisiones humanas y acentos cada 4.
    let seed = 3;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5) * 0.03;
    const notes = Array.from({ length: 48 }, (_, i) => {
      const t = 0.4 + (i * 60) / 96 + rnd();
      const n = note(60 + (i % 5), t, t + 0.3);
      n.velocity = i % 4 === 0 ? 110 : 70;
      return n;
    });
    const beats = beatsOf({ ...take(notes), tempoMap: [] });
    expect(beats.source).toBe('estimated');
    expect(Math.abs(beats.bpm - 96) / 96).toBeLessThan(0.03);
    // Cada nota cae a menos de 60 ms de un pulso.
    for (const n of notes) {
      expect(Math.min(...beats.times.map((b) => Math.abs(b - n.start)))).toBeLessThan(0.06);
    }
  });

  it('con mapa de tempo usa el del archivo', () => {
    expect(beatsOf(take([note(60, 0, 1)], 90)).times.slice(0, 3)).toEqual([0, 60 / 90, 120 / 90]);
  });
});

describe('cuantización y figuras', () => {
  it('ajusta a semicorcheas y elige tresillos solo donde encajan', () => {
    expect(quantizeOnsets([0.02, 0.51, 1.0, 1.34, 1.66, 2.26])).toEqual([0, 6, 12, 16, 20, 27]);
  });

  it('parte en figuras legibles sin cruzar el pulso salvo desde uno', () => {
    expect(splitFigures(0, 48, 48)).toEqual([[0, 48]]);
    expect(splitFigures(6, 30, 48)).toEqual([
      [6, 12],
      [12, 30],
    ]);
    expect(splitFigures(12, 20, 48)).toEqual([[12, 20]]);
  });
});

describe('partitura', () => {
  it('escala en negras: dos compases, en do mayor, mano izquierda con silencios', () => {
    const scale = [60, 62, 64, 65, 67, 69, 71, 72].map((p, i) =>
      note(p, i * 0.5, i * 0.5 + 0.45, 'R'),
    );
    const s = buildScore(take(scale), { beats: beatsOf(take(scale)) });
    expect(s.measures).toHaveLength(2);
    expect(s.fifths).toBe(0);
    expect(s.measures[0]!.staves[0].map((e) => [e.pitches[0], e.type])).toEqual([
      [60, 'quarter'],
      [62, 'quarter'],
      [64, 'quarter'],
      [65, 'quarter'],
    ]);
    expect(s.measures[0]!.staves[1]).toMatchObject([{ wholeMeasure: true }]);
  });

  it('una nota que cruza la barra se liga', () => {
    // Do en el pulso 4 que dura dos negras (hasta el pulso 2 del compás siguiente).
    const t = take([note(60, 1.5, 2.5, 'R'), note(64, 2.5, 3.5, 'R')]);
    const s = buildScore(t, { beats: beatsOf(t) });
    const last = s.measures[0]!.staves[0].at(-1)!;
    const first = s.measures[1]!.staves[0][0]!;
    expect([last.pitches, last.tieStart, first.pitches, first.tieStop]).toEqual([
      [60],
      true,
      [60],
      true,
    ]);
  });

  it('el pedal sostiene la nota escrita y se anota Ped. y suelta', () => {
    // Do corto, pedal hasta el pulso 3: se escribe blanca.
    const t = take([note(48, 0, 0.1, 'L')], 120, [
      { time: 0, value: 127 },
      { time: 1, value: 0 },
    ]);
    const s = buildScore(t, { beats: beatsOf(t) });
    expect(s.measures[0]!.staves[1][0]).toMatchObject({ pitches: [48], type: 'half' });
    expect(s.measures[0]!.pedals).toEqual([
      { position: 0, type: 'start' },
      { position: 2 * DIV, type: 'stop' },
    ]);
  });

  it('armadura: re mayor y la menor', () => {
    const d = [62, 66, 69, 62, 64, 66, 67, 69, 71, 73, 74].map((p, i) => note(p, i, i + 0.9));
    expect(estimateKey(d)).toMatchObject({ fifths: 2, mode: 'major' });
    const a = [57, 60, 64, 57, 59, 60, 62, 64, 65, 68, 69, 57].map((p, i) => note(p, i, i + 0.9));
    expect(estimateKey(a)).toMatchObject({ fifths: 0, mode: 'minor' });
  });

  it('MusicXML bien formado, con armadura, compás, dos pentagramas y pedal', () => {
    const t = take(
      [
        note(60, 0, 0.45, 'R'),
        note(64, 0, 0.45, 'R'),
        note(48, 0, 1.9, 'L'),
        note(61, 0.5, 1, 'R'),
      ],
      120,
      [
        { time: 0, value: 127 },
        { time: 1.5, value: 0 },
      ],
    );
    const xml = toMusicXml(buildScore(t, { beats: beatsOf(t) }));
    expect(balanced(xml)).toBe(true);
    expect(xml).toContain('<divisions>12</divisions>');
    expect(xml).toContain('<staves>2</staves>');
    expect(xml).toContain('<chord/>');
    expect(xml).toContain('<pedal type="start"');
    expect(xml).toContain('<work-title>Prueba &amp; &lt;partitura&gt;</work-title>');
  });

  it('la toma cuantizada une las notas ligadas', () => {
    const t = take([note(60, 1.5, 2.5, 'R')]);
    const q = quantizedTake(buildScore(t, { beats: beatsOf(t) }));
    expect(q.tracks[0]!.notes.map((n) => [n.pitch, n.start, n.end])).toEqual([[60, 1.5, 2.5]]);
  });
});
