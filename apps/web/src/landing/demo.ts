import { KEYBOARD_PRESETS, createNoteEvent, createTake, createTrack } from '@impromptu/core';
import type { NoteEvent, PedalEvent, Take } from '@impromptu/core';

/**
 * Pieza de demostración para la portada: una progresión I–V–vi–IV en Do con arpegios
 * en la mano izquierda y melodía en la derecha, con pedal. Determinista y en bucle.
 */
const BPM = 84;
const BEAT = 60 / BPM;
const CHORDS: { bass: number; arp: number[] }[] = [
  { bass: 48, arp: [48, 55, 60, 64] }, // Do
  { bass: 43, arp: [43, 50, 55, 59] }, // Sol
  { bass: 45, arp: [45, 52, 57, 60] }, // Lam
  { bass: 41, arp: [41, 48, 53, 57] }, // Fa
];
const MELODY: [number, number, number][] = [
  // [nota, pulso de inicio dentro del compás, duración en pulsos]
  [76, 0, 1.5],
  [74, 1.5, 0.5],
  [72, 2, 2],
  [74, 0, 1],
  [71, 1, 1],
  [67, 2, 2],
  [72, 0, 1.5],
  [76, 1.5, 0.5],
  [79, 2, 2],
  [77, 0, 1],
  [76, 1, 1],
  [72, 2, 1],
  [74, 3, 1],
];

export function createDemoPiece(): Take {
  const notes: NoteEvent[] = [];
  const pedals: PedalEvent[] = [];
  let melodyIndex = 0;
  const bars = 8;
  for (let bar = 0; bar < bars; bar++) {
    const chord = CHORDS[bar % CHORDS.length]!;
    const t0 = bar * 4 * BEAT;
    // Pedal: se cambia al empezar cada compás.
    pedals.push(
      { kind: 'sustain', time: t0 + 0.02, value: 127 },
      { kind: 'sustain', time: t0 + 4 * BEAT - 0.08, value: 0 },
    );
    // Mano izquierda: arpegio en corcheas.
    for (let i = 0; i < 8; i++) {
      const pitch = chord.arp[i % 4]! + (i >= 4 ? 12 : 0);
      notes.push(
        createNoteEvent({
          pitch: i === 0 ? chord.bass : pitch,
          start: t0 + i * (BEAT / 2),
          end: t0 + i * (BEAT / 2) + BEAT * 0.45,
          velocity: i === 0 ? 92 : 58 + ((i * 7) % 20),
          origin: 'edit',
          hand: 'L',
          handSource: 'auto',
        }),
      );
    }
    // Mano derecha: melodía.
    const barMelody: [number, number, number][] = [];
    while (melodyIndex < MELODY.length && barMelody.reduce((s, m) => s + m[2], 0) < 4) {
      barMelody.push(MELODY[melodyIndex % MELODY.length]!);
      melodyIndex++;
    }
    if (melodyIndex >= MELODY.length) melodyIndex = 0;
    for (const [pitch, beat, length] of barMelody) {
      notes.push(
        createNoteEvent({
          pitch: pitch + (bar >= 4 ? 12 : 0),
          start: t0 + beat * BEAT,
          end: t0 + (beat + length) * BEAT - 0.04,
          velocity: 96,
          origin: 'edit',
          hand: 'R',
          handSource: 'auto',
        }),
      );
    }
  }
  return createTake({
    title: 'Demostración',
    tracks: [createTrack({ notes, pedals })],
    duration: bars * 4 * BEAT,
    tempoMap: [{ time: 0, bpm: BPM }],
    timeSignature: [4, 4],
    keyboardRange: { ...KEYBOARD_PRESETS[61] },
  });
}
