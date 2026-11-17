import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  PIANO_KEYS,
  SEGMENT_SAMPLES,
  binarize,
  joinSegments,
  outputsToEvents,
  splitSegments,
} from './postprocess';
import type { PianoOutputs } from './postprocess';

/** Salidas vacías de `frames` cuadros. */
function empty(frames: number): PianoOutputs {
  const m = () => new Float32Array(frames * PIANO_KEYS);
  return {
    frames,
    regOnset: m(),
    regOffset: m(),
    frame: m(),
    velocity: m(),
    pedalOffset: new Float32Array(frames),
    pedalFrame: new Float32Array(frames),
  };
}

/** Pone un pico triangular (como la regresión del modelo) centrado en `at`. */
function peak(m: Float32Array, columns: number, col: number, at: number, height = 0.9) {
  for (let d = -5; d <= 5; d++)
    m[(at + d) * columns + col] = Math.max(0, height - Math.abs(d) * 0.15);
}

describe('posprocesado del modelo de piano', () => {
  it('un pico simétrico da un ataque exacto en ese cuadro', () => {
    const m = new Float32Array(40);
    peak(m, 1, 0, 20);
    const { binary, shift } = binarize(m, 40, 1, 0.3, 2);
    expect(Array.from(binary).indexOf(1)).toBe(20);
    expect(shift[20]).toBeCloseTo(0, 5);
  });

  it('arma una nota con su fuerza y un pedal', () => {
    const o = empty(300);
    const key = 60 - 21;
    peak(o.regOnset, PIANO_KEYS, key, 50);
    peak(o.regOffset, PIANO_KEYS, key, 150);
    for (let i = 50; i < 152; i++) o.frame[i * PIANO_KEYS + key] = 0.9;
    o.velocity[50 * PIANO_KEYS + key] = 0.5;
    for (let i = 40; i < 200; i++) o.pedalFrame[i] = 0.9;
    peak(o.pedalOffset, 1, 0, 200);
    const { notes, pedals } = outputsToEvents(o);
    expect(notes).toEqual([{ pitch: 60, start: 0.5, end: 1.5, velocity: 64 }]);
    expect(pedals).toHaveLength(1);
    expect(pedals[0]!.start).toBeCloseTo(0.4, 5);
    expect(pedals[0]!.end).toBeCloseTo(2.0, 5);
  });

  it('corta en segmentos de 10 s solapados y los vuelve a unir sin repetir cuadros', () => {
    expect(splitSegments(new Float32Array(SEGMENT_SAMPLES * 2))).toHaveLength(3);
    expect(splitSegments(new Float32Array(100))).toHaveLength(1);
    // 3 segmentos de 1001 cuadros (1 columna): 750 + 500 + 750 = 2000 cuadros = 20 s.
    const seg = (v: number) => new Float32Array(1001).fill(v);
    const joined = joinSegments([seg(1), seg(2), seg(3)], 1);
    expect(joined.length).toBe(2000);
    expect([joined[0], joined[749], joined[750], joined[1249], joined[1250]]).toEqual([
      1, 1, 2, 2, 3,
    ]);
  });
});

/**
 * Comparación con el posprocesado original en Python (scripts en D:\.cache\claude-tmp\kong_golden.py).
 * Solo corre donde existen esos archivos (el equipo de Jacobo); en el CI se salta.
 */
const GOLDEN = 'D:/.cache/models/golden';
describe.skipIf(!existsSync(`${GOLDEN}/events.json`))('igual que el original en Python', () => {
  it('mismas notas, fuerzas y pedales con las mismas salidas del modelo', () => {
    const ref = JSON.parse(readFileSync(`${GOLDEN}/events.json`, 'utf8')) as {
      meta: { frames: number };
      notes: { pitch: number; start: number; end: number; velocity: number }[];
      pedals: { start: number; end: number }[];
    };
    const read = (k: string) =>
      new Float32Array(readFileSync(`${GOLDEN}/${k}.f32`).buffer.slice(0));
    const out: PianoOutputs = {
      frames: ref.meta.frames,
      regOnset: read('reg_onset_output'),
      regOffset: read('reg_offset_output'),
      frame: read('frame_output'),
      velocity: read('velocity_output'),
      pedalOffset: read('reg_pedal_offset_output'),
      pedalFrame: read('pedal_frame_output'),
    };
    const { notes, pedals } = outputsToEvents(out);
    const sortRef = [...ref.notes].sort((a, b) => a.start - b.start || a.pitch - b.pitch);
    expect(notes.length).toBe(sortRef.length);
    notes.forEach((n, i) => {
      const r = sortRef[i]!;
      expect(n.pitch).toBe(r.pitch);
      expect(n.start).toBeCloseTo(r.start, 4);
      expect(n.end).toBeCloseTo(r.end, 4);
      expect(Math.abs(n.velocity - r.velocity)).toBeLessThanOrEqual(1);
    });
    expect(pedals.length).toBe(ref.pedals.length);
    pedals.forEach((p, i) => {
      expect(p.start).toBeCloseTo(ref.pedals[i]!.start, 4);
      expect(p.end).toBeCloseTo(ref.pedals[i]!.end, 4);
    });
  });
});
