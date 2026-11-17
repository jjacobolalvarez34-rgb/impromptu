/**
 * Decodificación de Transkun V2 (Yujia Yan; código MIT): Viterbi del semi-CRF de intervalos,
 * lectura de fuerza y ajuste fino de cada nota, y unión de segmentos solapados. Port línea a
 * línea de `CRF/NeuralSemiCRFInterval.viterbiBackward`, `transcribeFrames` y `transcribe`.
 */

export type Interval = [number, number];

/**
 * Viterbi hacia atrás. `S`: [T, T, nSym] (S[fin][inicio][símbolo]); `skip`: [T-1, nSym].
 * Devuelve, por símbolo, los intervalos [inicio, fin] en cuadros, desde `forcedStart[s]`.
 */
export function viterbiBackward(
  S: Float32Array,
  skip: Float32Array,
  T: number,
  nSym: number,
  forcedStart: readonly number[],
): Interval[][] {
  const at = (end: number, begin: number, s: number) => S[(end * T + begin) * nSym + s]!;
  const result: Interval[][] = [];
  const q = new Float64Array(T);
  const ptr = new Int32Array(T); // ptr[i - 1] del original, por posición
  for (let s = 0; s < nSym; s++) {
    const last = at(T - 1, T - 1, s);
    q.fill(0);
    q[T - 1] = last > 0 ? last : 0;
    for (let i = 1; i < T; i++) {
      const pos = T - i - 1;
      // Opción 0: saltar (sin intervalo que empiece aquí).
      let best = q[pos + 1]! + skip[pos * nSym + s]!;
      let selection = 0;
      // Opción k+1: un intervalo [pos, pos+1+k].
      for (let k = 0; k < i; k++) {
        const v = q[pos + 1 + k]! + at(pos + 1 + k, pos, s);
        if (v > best) {
          best = v;
          selection = k + 1;
        }
      }
      ptr[i - 1] = selection - 1;
      const diag = at(pos, pos, s);
      q[pos] = best + (diag > 0 ? diag : 0);
    }
    const intervals: Interval[] = [];
    let j = forcedStart[s] ?? 0;
    while (j < T - 1) {
      const sel = ptr[T - j - 2]!;
      if (at(j, j, s) > 0) intervals.push([j, j]);
      if (sel < 0) j += 1;
      else {
        const i = sel + j + 1;
        intervals.push([j, i]);
        j = i;
      }
    }
    if (last > 0) intervals.push([T - 1, T - 1]);
    result.push(intervals);
  }
  return result;
}

/** Media de una Bernoulli continua con estos logits (como torch.distributions). */
export function continuousBernoulliMean(logit: number): number {
  const p = 1 / (1 + Math.exp(-logit));
  if (p < 0.499 || p > 0.501) return p / (2 * p - 1) + 1 / (Math.log1p(-p) - Math.log(p));
  const x = p - 0.5;
  return 0.5 + (1 / 3 + (16 / 45) * x * x) * x;
}

export interface TkNote {
  /** Tecla MIDI, o -64 (sustain) y -67 (una corda) para los pedales. */
  pitch: number;
  start: number;
  end: number;
  velocity: number;
  hasOnset: boolean;
  hasOffset: boolean;
}

/**
 * Notas de un segmento a partir de sus intervalos y de lo que dicen las cabezas.
 * `velocityLogits`: [N, 128]; `of`: [N, 4] (ajuste de inicio y fin, y si los tiene), en el
 * orden de los intervalos (símbolo por símbolo).
 */
export function segmentNotes(
  intervals: Interval[][],
  symbols: readonly number[],
  velocityLogits: Float32Array,
  of: Float32Array,
  frameDur: number,
  lastFrameIdx: number,
): { notes: TkNote[]; lastP: number[] } {
  const notes: TkNote[] = [];
  const lastP: number[] = [];
  let n = 0;
  intervals.forEach((list, s) => {
    let lastEnd = 0;
    let curLastP = 0;
    for (const [a, b] of list) {
      let vel = 0;
      for (let v = 1; v < 128; v++) {
        if (velocityLogits[n * 128 + v]! > velocityLogits[n * 128 + vel]!) vel = v;
      }
      const ofs = (k: number) =>
        Math.min(0.5, Math.max(-0.5, (continuousBernoulliMean(of[n * 4 + k]!) - 0.5) / 0.99));
      let start = (a + ofs(0)) * frameDur;
      let end = (b + ofs(1)) * frameDur;
      const hasOnset = a > 0 || of[n * 4 + 2]! > 0;
      const hasOffset = b < lastFrameIdx || of[n * 4 + 3]! > 0;
      start = Math.max(start, lastEnd);
      end = Math.max(end, start + 1e-8);
      lastEnd = end;
      notes.push({ pitch: symbols[s]!, start, end, velocity: vel, hasOnset, hasOffset });
      if (hasOffset) curLastP = b;
      n++;
    }
    lastP.push(curLastP);
  });
  notes.sort((x, y) => x.start - y.start || x.end - y.end || x.pitch - y.pitch);
  return { notes, lastP };
}

/** Une los eventos de un segmento con los anteriores (mergeIncompleteEvent del original). */
export function mergeSegment(byType: Map<number, TkNote[]>, segment: readonly TkNote[]): void {
  for (const e of segment) {
    const list = byType.get(e.pitch) ?? [];
    byType.set(e.pitch, list);
    const last = list[list.length - 1];
    if (last && e.start < last.end) {
      if (e.hasOnset) list[list.length - 1] = e;
      else {
        last.hasOffset = e.hasOffset;
        last.end = Math.max(e.end, last.end);
      }
      continue;
    }
    if (e.hasOnset) list.push(e);
  }
}

/** Cierra la unión: el último de cada tipo termina, se quitan los sin final y los solapes. */
export function finishEvents(byType: Map<number, TkNote[]>): TkNote[] {
  for (const list of byType.values()) {
    if (list.length > 0) list[list.length - 1]!.hasOffset = true;
  }
  const all = [...byType.values()].flat().filter((e) => e.hasOffset);
  all.sort((x, y) => x.start - y.start || x.end - y.end || x.pitch - y.pitch);
  // resolveOverlapping: una nota nueva de la misma tecla corta a la anterior.
  const lastByPitch = new Map<number, TkNote>();
  for (const e of all) {
    const prev = lastByPitch.get(e.pitch);
    if (prev && prev.end > e.start) prev.end = e.start;
    lastByPitch.set(e.pitch, e);
  }
  return all
    .filter((e) => e.start < e.end)
    .sort((x, y) => x.start - y.start || x.end - y.end || x.pitch - y.pitch);
}
