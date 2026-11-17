import { createNoteEvent, createTake, createTrack, fitKeyboardRange } from '@impromptu/core';
import type { NoteEvent, Take } from '@impromptu/core';

/** Nota tal como la entrega Basic Pitch (NoteEventTime). */
export interface RawNote {
  startTimeSeconds: number;
  durationSeconds: number;
  pitchMidi: number;
  amplitude: number;
}

export interface NotesOptions {
  /** Notas más cortas que esto se descartan (ruido, s). */
  minDuration?: number;
  /** Notas más suaves que esto se descartan (0–1). */
  minAmplitude?: number;
}

/**
 * Convierte la salida de Basic Pitch en notas del modelo (origin 'audio'). La fuerza sale
 * de la amplitud; las notas muy cortas o muy suaves se descartan como ruido.
 */
export function rawToNotes(raw: readonly RawNote[], options: NotesOptions = {}): NoteEvent[] {
  const minDuration = options.minDuration ?? 0.04;
  const minAmplitude = options.minAmplitude ?? 0.08;
  return raw
    .filter((n) => n.durationSeconds >= minDuration && n.amplitude >= minAmplitude)
    .filter((n) => n.pitchMidi >= 0 && n.pitchMidi <= 127)
    .map((n) =>
      createNoteEvent({
        pitch: Math.round(n.pitchMidi),
        start: Math.max(0, n.startTimeSeconds),
        end: Math.max(0, n.startTimeSeconds) + n.durationSeconds,
        velocity: Math.min(127, Math.max(1, Math.round(20 + n.amplitude * 107))),
        origin: 'audio',
      }),
    )
    .sort((a, b) => a.start - b.start || a.pitch - b.pitch);
}

/** Toma a partir de notas transcritas; el título es el nombre del archivo o "Micrófono". */
export function takeFromTranscription(
  raw: readonly RawNote[],
  title: string,
  duration: number,
): Take {
  const notes = rawToNotes(raw);
  return createTake({
    title,
    tracks: [createTrack({ name: 'Piano (transcrito)', notes })],
    duration: Math.max(duration, ...notes.map((n) => n.end), 0),
    keyboardRange: fitKeyboardRange(notes.map((n) => n.pitch)),
  });
}
