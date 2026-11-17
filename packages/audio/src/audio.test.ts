import { createNoteEvent } from '@impromptu/core';
import type { PedalEvent } from '@impromptu/core';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LAYERS,
  allSampleNames,
  layerFor,
  layerGain,
  nearestSample,
  sampleName,
} from './salamander';
import { pedalDownRanges, resolveVoices } from './sustain';

let n = 0;
const note = (pitch: number, start: number, end: number, velocity = 80) =>
  createNoteEvent({ pitch, start, end, velocity, origin: 'midi-file' }, () => `n${++n}`);
const ped = (kind: PedalEvent['kind'], time: number, value: number): PedalEvent => ({
  kind,
  time,
  value,
});

describe('muestras del Salamander', () => {
  it('nombra los archivos como en el servidor (Ds1v8, Fs4v1, A0v16, C8v16)', () => {
    expect(sampleName(27, 8)).toBe('Ds1v8');
    expect(sampleName(66, 1)).toBe('Fs4v1');
    expect(sampleName(21, 16)).toBe('A0v16');
    expect(sampleName(108, 16)).toBe('C8v16');
    expect(() => sampleName(61, 1)).toThrow();
  });

  it('30 teclas × 5 capas = 150 archivos', () => {
    expect(allSampleNames()).toHaveLength(150);
    expect(new Set(allSampleNames()).size).toBe(150);
  });

  it('usa la muestra más cercana, a lo sumo a 1 semitono', () => {
    for (let p = 21; p <= 108; p++) expect(Math.abs(nearestSample(p) - p)).toBeLessThanOrEqual(1);
    expect(nearestSample(10)).toBe(21);
    expect(nearestSample(120)).toBe(108);
  });

  it('elige capas suaves para velocity baja y fuertes para alta', () => {
    expect(layerFor(1)).toBe(1);
    expect(layerFor(64)).toBe(9);
    expect(layerFor(127)).toBe(16);
    const layers = Array.from({ length: 127 }, (_, i) => layerFor(i + 1));
    layers.slice(1).forEach((l, i) => expect(l).toBeGreaterThanOrEqual(layers[i]!));
    expect(DEFAULT_LAYERS).toContain(layerFor(100));
  });

  it('la ganancia dentro de la capa crece con la velocity', () => {
    expect(layerGain(60, 9)).toBeLessThan(layerGain(70, 9));
    expect(layerGain(1, 1)).toBeGreaterThan(0);
  });
});

describe('pedales y apagadores', () => {
  it('rangos de pedal abajo, con medio pedal y pedal que nunca se suelta', () => {
    const pedals = [
      ped('sustain', 1, 127),
      ped('sustain', 2, 30),
      ped('sustain', 3, 64),
      ped('soft', 0, 127),
    ];
    expect(pedalDownRanges(pedals, 'sustain')).toEqual([
      [1, 2],
      [3, Infinity],
    ]);
  });

  it('sin pedal, la nota se apaga al soltar la tecla', () => {
    const [v] = resolveVoices([note(60, 0, 1)], []);
    expect(v!.release).toBe(1);
    expect(v!.gain).toBe(1);
  });

  it('con sustain abajo al soltar, suena hasta soltar el pedal', () => {
    const pedals = [ped('sustain', 0.5, 127), ped('sustain', 3, 0)];
    const [a, b] = resolveVoices([note(60, 0, 1), note(64, 3.5, 4)], pedals);
    expect(a!.release).toBe(3);
    expect(b!.release).toBe(4);
  });

  it('el sostenuto solo sostiene las notas que sonaban al pisarlo', () => {
    const pedals = [ped('sostenuto', 1, 127), ped('sostenuto', 5, 0)];
    const [held, later] = resolveVoices([note(48, 0, 2), note(72, 1.5, 2)], pedals);
    expect(held!.release).toBe(5);
    expect(later!.release).toBe(2);
  });

  it('repetir una tecla sostenida corta la nota anterior', () => {
    const pedals = [ped('sustain', 0, 127), ped('sustain', 10, 0)];
    const [first, second] = resolveVoices([note(60, 0, 1), note(60, 2, 3)], pedals);
    expect(first!.release).toBe(2);
    expect(second!.release).toBe(10);
  });

  it('una corda baja la ganancia de las notas que empiezan con él pisado', () => {
    const pedals = [ped('soft', 1, 127), ped('soft', 2, 0)];
    const voices = resolveVoices([note(60, 0, 3), note(62, 1.5, 3)], pedals);
    expect(voices.map((v) => v.gain)).toEqual([1, 0.72]);
  });
});
