/**
 * Posprocesado del modelo de piano de Kong et al. (2021), "High-resolution piano transcription
 * with pedals by regressing onset and offset times". Port a TypeScript del de
 * `piano_transcription_inference` (MIT, Qiuqiang Kong): de las curvas del modelo a notas y pedal.
 *
 * Las salidas van en matrices planas [cuadro * columnas + columna], a 100 cuadros por segundo.
 */

export const FRAMES_PER_SECOND = 100;
export const PIANO_KEYS = 88;
/** Nota MIDI de la primera tecla (La 0). */
export const BEGIN_NOTE = 21;
/** Muestras por segundo que espera el modelo. */
export const PIANO_SAMPLE_RATE = 16_000;
/** Segmento de 10 s, con solape de la mitad. */
export const SEGMENT_SAMPLES = PIANO_SAMPLE_RATE * 10;

export interface PianoThresholds {
  onset: number;
  offset: number;
  frame: number;
  pedalOffset: number;
}

/** Los umbrales del modelo original. */
export const KONG_THRESHOLDS: PianoThresholds = {
  onset: 0.3,
  offset: 0.3,
  frame: 0.1,
  pedalOffset: 0.2,
};

/** Salidas del modelo para toda la pieza (ya unidas), una matriz por salida. */
export interface PianoOutputs {
  frames: number;
  regOnset: Float32Array; // frames × 88
  regOffset: Float32Array; // frames × 88
  frame: Float32Array; // frames × 88
  velocity: Float32Array; // frames × 88
  pedalOffset: Float32Array; // frames × 1
  pedalFrame: Float32Array; // frames × 1
}

export interface PianoNote {
  pitch: number;
  start: number;
  end: number;
  /** 1–127 */
  velocity: number;
}

export interface PianoPedal {
  start: number;
  end: number;
}

/** ¿La curva sube hasta n y baja después de n, en `neighbour` cuadros a cada lado? */
function isMonotonicNeighbour(x: (i: number) => number, n: number, neighbour: number): boolean {
  for (let i = 0; i < neighbour; i++) {
    if (x(n - i) < x(n - i - 1)) return false;
    if (x(n + i) < x(n + i + 1)) return false;
  }
  return true;
}

/**
 * De la regresión de ataques (o finales) a picos binarios con su corrimiento fino dentro
 * del cuadro (sección III-D del artículo).
 */
export function binarize(
  reg: Float32Array,
  frames: number,
  columns: number,
  threshold: number,
  neighbour: number,
): { binary: Uint8Array; shift: Float32Array } {
  const binary = new Uint8Array(frames * columns);
  const shift = new Float32Array(frames * columns);
  for (let k = 0; k < columns; k++) {
    const x = (i: number) => reg[i * columns + k]!;
    for (let n = neighbour; n < frames - neighbour; n++) {
      if (x(n) > threshold && isMonotonicNeighbour(x, n, neighbour)) {
        binary[n * columns + k] = 1;
        shift[n * columns + k] =
          x(n - 1) > x(n + 1)
            ? (x(n + 1) - x(n - 1)) / (x(n) - x(n + 1)) / 2
            : (x(n + 1) - x(n - 1)) / (x(n) - x(n - 1)) / 2;
      }
    }
  }
  return { binary, shift };
}

/** Notas de una tecla: [inicio, fin, corrimiento de inicio, corrimiento de fin, fuerza]. */
function detectNotes(
  frames: number,
  at: (m: Float32Array | Uint8Array, i: number) => number,
  o: {
    frame: Float32Array;
    onset: Uint8Array;
    onsetShift: Float32Array;
    offset: Uint8Array;
    offsetShift: Float32Array;
    velocity: Float32Array;
  },
  frameThreshold: number,
): [number, number, number, number, number][] {
  const out: [number, number, number, number, number][] = [];
  // Como en el original, 0 cuenta como "sin valor" (los picos nunca caen en el cuadro 0).
  let bgn = 0;
  let frameDisappear = 0;
  let offsetOccur = 0;
  for (let i = 0; i < frames; i++) {
    if (at(o.onset, i) === 1) {
      if (bgn) {
        // Dos ataques seguidos de la misma tecla sin soltarla.
        out.push([bgn, Math.max(i - 1, 0), at(o.onsetShift, bgn), 0, at(o.velocity, bgn)]);
        frameDisappear = offsetOccur = 0;
      }
      bgn = i;
    }
    if (bgn && i > bgn) {
      if (at(o.frame, i) <= frameThreshold && !frameDisappear) frameDisappear = i;
      if (at(o.offset, i) === 1 && !offsetOccur) offsetOccur = i;
      if (frameDisappear) {
        const fin =
          offsetOccur && offsetOccur - bgn > frameDisappear - offsetOccur
            ? offsetOccur
            : frameDisappear;
        out.push([bgn, fin, at(o.onsetShift, bgn), at(o.offsetShift, fin), at(o.velocity, bgn)]);
        bgn = frameDisappear = offsetOccur = 0;
      }
      if (bgn && (i - bgn >= 600 || i === frames - 1)) {
        // No se encontró el final: se cierra a los 6 s o al terminar.
        out.push([bgn, i, at(o.onsetShift, bgn), at(o.offsetShift, i), at(o.velocity, bgn)]);
        bgn = frameDisappear = offsetOccur = 0;
      }
    }
  }
  return out;
}

/** Pedal de sustain desde la probabilidad por cuadro y la regresión de soltarlo. */
function detectPedals(
  frames: number,
  frame: Float32Array,
  offset: Uint8Array,
  offsetShift: Float32Array,
  frameThreshold: number,
): [number, number, number, number][] {
  const out: [number, number, number, number][] = [];
  let bgn = 0;
  let frameDisappear = 0;
  let offsetOccur = 0;
  for (let i = 1; i < frames; i++) {
    if (frame[i]! >= frameThreshold && frame[i]! > frame[i - 1]! && !bgn) bgn = i;
    if (bgn && i > bgn) {
      if (frame[i]! <= frameThreshold && !frameDisappear) frameDisappear = i;
      if (offset[i] === 1 && !offsetOccur) offsetOccur = i;
      if (offsetOccur) {
        out.push([bgn, offsetOccur, 0, offsetShift[offsetOccur]!]);
        bgn = frameDisappear = offsetOccur = 0;
      }
      if (frameDisappear && i - frameDisappear >= 10) {
        out.push([bgn, frameDisappear, 0, offsetShift[frameDisappear]!]);
        bgn = frameDisappear = offsetOccur = 0;
      }
    }
  }
  return out;
}

/** De las salidas del modelo a notas (con fuerza) y pedal de sustain, en segundos. */
export function outputsToEvents(
  out: PianoOutputs,
  thresholds: PianoThresholds = KONG_THRESHOLDS,
): { notes: PianoNote[]; pedals: PianoPedal[] } {
  const F = out.frames;
  const K = PIANO_KEYS;
  const onset = binarize(out.regOnset, F, K, thresholds.onset, 2);
  const offset = binarize(out.regOffset, F, K, thresholds.offset, 4);

  const notes: PianoNote[] = [];
  for (let k = 0; k < K; k++) {
    const at = (m: Float32Array | Uint8Array, i: number) => m[i * K + k]!;
    const found = detectNotes(
      F,
      at,
      {
        frame: out.frame,
        onset: onset.binary,
        onsetShift: onset.shift,
        offset: offset.binary,
        offsetShift: offset.shift,
        velocity: out.velocity,
      },
      thresholds.frame,
    );
    for (const [bgn, fin, onShift, offShift, vel] of found) {
      notes.push({
        pitch: k + BEGIN_NOTE,
        start: (bgn + onShift) / FRAMES_PER_SECOND,
        end: (fin + offShift) / FRAMES_PER_SECOND,
        velocity: Math.min(127, Math.max(1, Math.trunc(vel * 128))),
      });
    }
  }
  notes.sort((a, b) => a.start - b.start || a.pitch - b.pitch);

  const pedalOffset = binarize(out.pedalOffset, F, 1, thresholds.pedalOffset, 4);
  const pedals = detectPedals(F, out.pedalFrame, pedalOffset.binary, pedalOffset.shift, 0.5).map(
    ([bgn, fin, onShift, offShift]) => ({
      start: (bgn + onShift) / FRAMES_PER_SECOND,
      end: (fin + offShift) / FRAMES_PER_SECOND,
    }),
  );
  return { notes, pedals };
}

/**
 * Une las salidas de segmentos de 10 s solapados a la mitad (como `deframe` del original):
 * del primero se toma hasta el 75 %, de los del medio del 25 % al 75 % y del último desde el 25 %.
 * Cada segmento trae un cuadro de más al final (por el STFT centrado), que se descarta.
 */
export function joinSegments(segments: readonly Float32Array[], columns: number): Float32Array {
  if (segments.length === 1) return segments[0]!;
  const perSegment = segments[0]!.length / columns - 1;
  const q1 = Math.floor(perSegment * 0.25);
  const q3 = Math.floor(perSegment * 0.75);
  const parts: Float32Array[] = [];
  segments.forEach((seg, i) => {
    const from = i === 0 ? 0 : q1;
    const to = i === segments.length - 1 ? perSegment : q3;
    parts.push(seg.subarray(from * columns, to * columns));
  });
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Float32Array(total);
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

/** Corta el audio en segmentos de 10 s que avanzan de a 5 s (rellenando con silencio). */
export function splitSegments(samples: Float32Array): Float32Array[] {
  const padded = Math.max(1, Math.ceil(samples.length / SEGMENT_SAMPLES)) * SEGMENT_SAMPLES;
  const audio = new Float32Array(padded);
  audio.set(samples);
  const out: Float32Array[] = [];
  for (let p = 0; p + SEGMENT_SAMPLES <= padded; p += SEGMENT_SAMPLES / 2) {
    out.push(audio.subarray(p, p + SEGMENT_SAMPLES));
  }
  return out;
}
