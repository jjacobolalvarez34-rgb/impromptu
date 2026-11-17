import { validateTake } from '@impromptu/core';
import { describe, expect, it } from 'vitest';
import { rawToNotes, takeFromTranscription } from './notes';

const raw = (pitchMidi: number, start: number, duration: number, amplitude: number) => ({
  startTimeSeconds: start,
  durationSeconds: duration,
  pitchMidi,
  amplitude,
});

describe('notas transcritas', () => {
  it('convierte a notas de audio con fuerza según la amplitud', () => {
    const notes = rawToNotes([raw(60, 0.5, 0.4, 0.9), raw(64, 0, 0.3, 0.3)]);
    expect(notes.map((n) => n.pitch)).toEqual([64, 60]);
    expect(notes.every((n) => n.origin === 'audio' && n.hand === null)).toBe(true);
    expect(notes[1]!.velocity).toBeGreaterThan(notes[0]!.velocity);
  });

  it('descarta ruido: notas muy cortas o muy suaves', () => {
    expect(rawToNotes([raw(60, 0, 0.01, 0.9), raw(62, 0, 0.5, 0.01)])).toEqual([]);
  });

  it('arma una toma válida con el rango de teclado ajustado', () => {
    const take = takeFromTranscription(
      [raw(36, 0, 0.5, 0.8), raw(84, 1, 0.5, 0.8)],
      'Grabación',
      3,
    );
    expect(take.duration).toBe(3);
    expect(take.keyboardRange).toEqual({ low: 36, high: 96 });
    expect(validateTake(take)).toEqual([]);
  });
});
