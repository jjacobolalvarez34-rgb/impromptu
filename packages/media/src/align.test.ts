import { createNoteEvent } from '@impromptu/core';
import { describe, expect, it } from 'vitest';
import { CHROMA_HOP, alignAudioToNotes, audioChroma, toMono, waveformPeaks } from './align';

const RATE = 8000;
let n = 0;
const PITCHES = [60, 64, 67, 72, 62, 65, 69, 59, 55, 71, 64, 60, 57, 67, 74, 62];
const note = (start: number, i: number, velocity = 100) =>
  createNoteEvent(
    { pitch: PITCHES[i % PITCHES.length]!, start, end: start + 0.3, velocity, origin: 'midi-file' },
    () => `n${++n}`,
  );

/** Audio sintético: cada nota suena en su altura (con armónicos) y decae; ruido leve de fondo. */
function render(starts: number[], seconds: number, shift: number, pitches = PITCHES): Float32Array {
  const out = new Float32Array(Math.ceil(seconds * RATE));
  let seed = 7;
  const noise = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5) * 0.002;
  for (let i = 0; i < out.length; i++) out[i] = noise();
  starts.forEach((s, idx) => {
    const f0 = 440 * Math.pow(2, (pitches[idx % pitches.length]! - 69) / 12);
    const at = Math.round((s + shift) * RATE);
    for (let i = 0; i < RATE * 0.45 && at + i < out.length; i++) {
      if (at + i < 0) continue;
      const env = Math.exp(-i / (RATE * 0.12));
      const ph = (2 * Math.PI * f0 * i) / RATE;
      out[at + i]! += (Math.sin(ph) + 0.4 * Math.sin(2 * ph) + 0.2 * Math.sin(3 * ph)) * env;
    }
  });
  return out;
}

// Ritmo irregular (como una pieza real) para que no haya desfases ambiguos.
const STARTS = [0.5, 0.9, 1.2, 2.1, 2.4, 3.3, 3.5, 4.8, 5.1, 5.15, 6.4, 7.2, 7.9, 8.6, 9.75, 10.3];
const NOTES = () => STARTS.map((s, i) => note(s, i));

describe('sincronía audio ↔ MIDI', () => {
  // Convención de MediaRef.offset: segundo de la toma = segundo del archivo + offset.
  it('archivo con silencio al comienzo: offset negativo', () => {
    const audio = render(STARTS, 13, 1.25);
    const result = alignAudioToNotes(audio, RATE, NOTES());
    expect(result.offset).toBeCloseTo(-1.25, 1);
    expect(result.confidence).toBeGreaterThan(1.5);
  });

  it('archivo que empieza ya dentro de la pieza: offset positivo', () => {
    const audio = render(STARTS, 13, -0.4);
    const result = alignAudioToNotes(audio, RATE, NOTES());
    expect(result.offset).toBeCloseTo(0.4, 1);
  });

  it('sin desfase da 0', () => {
    const audio = render(STARTS, 13, 0);
    expect(alignAudioToNotes(audio, RATE, NOTES()).offset).toBeCloseTo(0, 1);
  });

  it('una pieza distinta da poca confianza', () => {
    const other = [0.3, 1.7, 2.9, 4.0, 4.6, 6.0, 6.9, 8.1, 9.2, 10.9];
    const otherPitches = [50, 53, 58, 61, 66, 70, 73, 49, 54, 63];
    const same = alignAudioToNotes(render(STARTS, 13, 0), RATE, NOTES());
    const different = alignAudioToNotes(render(other, 13, 0, otherPitches), RATE, NOTES());
    expect(different.confidence).toBeLessThan(same.confidence);
  });

  it('el cromagrama ubica la nota correcta', () => {
    const ch = audioChroma(render([0.2], 1, 0, [69]), RATE);
    const frame = ch[Math.round(0.35 / CHROMA_HOP)]!;
    expect(frame.indexOf(Math.max(...frame))).toBe(9); // La = clase 9
  });

  it('mezcla a mono y saca picos para la forma de onda', () => {
    const mono = toMono([Float32Array.from([1, 0, -1]), Float32Array.from([0, 0, 1])]);
    expect(Array.from(mono)).toEqual([0.5, 0, 0]);
    const peaks = waveformPeaks(Float32Array.from([0, 0.5, -1, 0.25]), 2);
    expect(Array.from(peaks)).toEqual([0.5, 1]);
  });
});
