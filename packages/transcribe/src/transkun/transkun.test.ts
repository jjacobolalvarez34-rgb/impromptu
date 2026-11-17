import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  continuousBernoulliMean,
  finishEvents,
  mergeSegment,
  segmentNotes,
  viterbiBackward,
} from './decode';
import type { TkNote } from './decode';
import { segmentFeatures } from './spectrum';

describe('decodificación de Transkun', () => {
  it('Viterbi elige el intervalo con buen puntaje y deja el resto en silencio', () => {
    const T = 6;
    const S = new Float32Array(T * T).fill(-10); // un símbolo
    S[4 * T + 1] = 5; // intervalo [1, 4]
    const skip = new Float32Array(T - 1);
    expect(viterbiBackward(S, skip, T, 1, [0])).toEqual([[[1, 4]]]);
  });

  it('la media de la Bernoulli continua es 0,5 con logit 0 y sube con el logit', () => {
    expect(continuousBernoulliMean(0)).toBeCloseTo(0.5, 6);
    expect(continuousBernoulliMean(3)).toBeGreaterThan(0.6);
    expect(continuousBernoulliMean(-3)).toBeLessThan(0.4);
  });

  it('arma notas con fuerza (la más probable) y une segmentos', () => {
    const velocity = new Float32Array(128);
    velocity[80] = 9;
    const { notes, lastP } = segmentNotes(
      [[], [[10, 20]]],
      [-64, 60],
      velocity,
      new Float32Array(4),
      0.1,
      100,
    );
    expect(notes).toEqual([
      { pitch: 60, start: 1, end: 2, velocity: 80, hasOnset: true, hasOffset: true },
    ]);
    expect(lastP).toEqual([0, 20]);
    const byType = new Map<number, TkNote[]>();
    mergeSegment(byType, notes);
    // El mismo evento visto en el segmento siguiente, sin ataque: solo alarga.
    mergeSegment(byType, [{ ...notes[0]!, start: 1.5, end: 2.5, hasOnset: false }]);
    expect(finishEvents(byType)).toEqual([{ ...notes[0]!, end: 2.5 }]);
  });
});

/**
 * Comparación con el original en Python (D:\.cache\claude-tmp\transkun_onnx.py y transkun_golden.py).
 * Solo corre donde existen esos archivos (el equipo de Jacobo); en el CI se salta.
 */
const G = 'D:/.cache/models/golden-transkun';
const M = 'D:/.cache/models';
const f32 = (path: string) => new Float32Array(readFileSync(path).buffer.slice(0));

describe.skipIf(!existsSync(`${G}/meta.json`))('igual que Transkun en Python', () => {
  const meta = existsSync(`${G}/meta.json`)
    ? (JSON.parse(readFileSync(`${G}/meta.json`, 'utf8')) as {
        frames: number[];
        features: number[];
        S: number[];
        forcedStartPos: number[];
        path: [number, number][][];
      })
    : null;

  it('Viterbi da la misma ruta con los mismos puntajes', () => {
    const [T, , nSym] = meta!.S as [number, number, number];
    const path = viterbiBackward(
      f32(`${G}/S.f32`),
      f32(`${G}/S_skip.f32`),
      T,
      nSym,
      meta!.forcedStartPos,
    );
    expect(path).toEqual(meta!.path);
  });

  it('las características del espectro coinciden', () => {
    const consts = JSON.parse(readFileSync(`${M}/transkun-espectro.json`, 'utf8'));
    const [, ch, T, win] = meta!.frames as [number, number, number, number];
    const frames = f32(`${G}/frames.f32`);
    const hop = consts.hopSize as number;
    const length = 16 * consts.fs;
    // El audio original se recupera de los cuadros (cada muestra está en algún cuadro).
    const channels = Array.from({ length: ch }, (_, c) => {
      const x = new Float32Array(length);
      for (let i = 0; i < length; i++) {
        const t = Math.floor(i / hop);
        x[i] = frames[(c * T + t) * win + (i - t * hop) + win / 2]!;
      }
      return x;
    });
    const got = segmentFeatures(channels, {
      ...consts,
      windows: f32(`${M}/transkun-ventanas.f32`),
      freq2mels: f32(`${M}/transkun-mel.f32`),
    });
    const want = f32(`${G}/features.f32`);
    expect(got.length).toBe(want.length);
    let maxErr = 0;
    for (let i = 0; i < want.length; i++) maxErr = Math.max(maxErr, Math.abs(got[i]! - want[i]!));
    expect(maxErr).toBeLessThan(1e-3);
  }, 120_000);
});
