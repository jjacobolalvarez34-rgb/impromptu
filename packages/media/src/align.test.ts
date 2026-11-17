import { createNoteEvent } from '@impromptu/core';
import { describe, expect, it } from 'vitest';
import { alignAudioToNotes, toMono, waveformPeaks } from './align';

const RATE = 8000;
let n = 0;
const note = (start: number, velocity = 100) =>
  createNoteEvent(
    { pitch: 60, start, end: start + 0.2, velocity, origin: 'midi-file' },
    () => `n${++n}`,
  );

/** Audio sintético: un golpe que decae en cada ataque, más un poco de ruido de fondo. */
function render(starts: number[], seconds: number, shift: number): Float32Array {
  const out = new Float32Array(Math.ceil(seconds * RATE));
  let seed = 7;
  const noise = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5) * 0.002;
  for (let i = 0; i < out.length; i++) out[i] = noise();
  for (const s of starts) {
    const at = Math.round((s + shift) * RATE);
    for (let i = 0; i < RATE * 0.3 && at + i < out.length; i++) {
      if (at + i < 0) continue;
      out[at + i]! += Math.sin((2 * Math.PI * 440 * i) / RATE) * Math.exp(-i / (RATE * 0.08));
    }
  }
  return out;
}

// Ritmo irregular (como una pieza real) para que no haya desfases ambiguos.
const STARTS = [0.5, 0.9, 1.2, 2.1, 2.4, 3.3, 3.5, 4.8, 5.1, 5.15, 6.4, 7.2, 7.9, 8.6, 9.75, 10.3];

describe('sincronía audio ↔ MIDI', () => {
  it('encuentra el desfase cuando el audio empieza después', () => {
    const audio = render(STARTS, 13, 1.25);
    const result = alignAudioToNotes(
      audio,
      RATE,
      STARTS.map((s) => note(s)),
    );
    expect(result.offset).toBeCloseTo(1.25, 1);
    expect(result.confidence).toBeGreaterThan(3);
  });

  it('y cuando el audio empieza antes (offset negativo)', () => {
    const audio = render(STARTS, 13, -0.4);
    const result = alignAudioToNotes(
      audio,
      RATE,
      STARTS.map((s) => note(s)),
    );
    expect(result.offset).toBeCloseTo(-0.4, 1);
  });

  it('sin desfase da 0', () => {
    const audio = render(STARTS, 13, 0);
    expect(
      alignAudioToNotes(
        audio,
        RATE,
        STARTS.map((s) => note(s)),
      ).offset,
    ).toBeCloseTo(0, 1);
  });

  it('una pieza distinta da poca confianza', () => {
    const other = [0.3, 1.7, 2.9, 4.0, 4.6, 6.0, 6.9, 8.1, 9.2, 10.9];
    const same = alignAudioToNotes(
      render(STARTS, 13, 0),
      RATE,
      STARTS.map((s) => note(s)),
    );
    const different = alignAudioToNotes(
      render(other, 13, 0),
      RATE,
      STARTS.map((s) => note(s)),
    );
    expect(different.confidence).toBeLessThan(same.confidence);
  });

  it('mezcla a mono y saca picos para la forma de onda', () => {
    const mono = toMono([Float32Array.from([1, 0, -1]), Float32Array.from([0, 0, 1])]);
    expect(Array.from(mono)).toEqual([0.5, 0, 0]);
    const peaks = waveformPeaks(Float32Array.from([0, 0.5, -1, 0.25]), 2);
    expect(Array.from(peaks)).toEqual([0.5, 1]);
  });
});
