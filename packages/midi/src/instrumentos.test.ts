import { createNoteEvent, createTake, createTrack } from '@impromptu/core';
import type { Instrument } from '@impromptu/core';
import { describe, expect, it } from 'vitest';
import { exportMidi } from './export';
import { importMidi } from './import';

const pista = (instrument: Instrument, pitch: number) =>
  createTrack({
    instrument,
    name: instrument,
    notes: [createNoteEvent({ pitch, start: 0, end: 0.5, velocity: 90, origin: 'edit' })],
  });

describe('MIDI de guitarra, bajo y batería', () => {
  it('ida y vuelta conserva el instrumento de cada pista', () => {
    const take = createTake({
      title: 'Banda',
      tracks: [pista('piano', 60), pista('guitar', 52), pista('bass', 40), pista('drums', 36)],
    });
    const { take: leida } = importMidi(exportMidi(take));
    expect(leida.tracks.map((t) => t.instrument).sort()).toEqual([
      'bass',
      'drums',
      'guitar',
      'piano',
    ]);
  });
});
