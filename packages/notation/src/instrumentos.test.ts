import { createNoteEvent, createTake, createTrack } from '@impromptu/core';
import type { Instrument } from '@impromptu/core';
import { describe, expect, it } from 'vitest';
import { buildScore } from './score';
import { toMusicXml } from './musicxml';
import { beatsOf } from './tempo';

function toma(instrument: Instrument, pitches: number[]) {
  const notes = pitches.map((pitch, i) =>
    createNoteEvent({ pitch, start: i * 0.5, end: i * 0.5 + 0.45, velocity: 90, origin: 'edit' }),
  );
  return createTake({
    title: 'Prueba',
    tracks: [createTrack({ instrument, notes })],
    tempoMap: [{ time: 0, bpm: 120 }],
  });
}

describe('partitura de otros instrumentos', () => {
  it('guitarra: pentagrama y tablatura con cuerda y traste', () => {
    const t = toma('guitar', [40, 45, 50, 55, 59, 64, 67, 69]);
    const score = buildScore(t, { beats: beatsOf(t), instrument: 'guitar' });
    const xml = toMusicXml(score, { instrument: 'guitar' });
    expect(xml).toContain('<sign>TAB</sign>');
    expect(xml).toContain('<staff-lines>6</staff-lines>');
    expect(xml).toContain('<string>6</string><fret>0</fret>');
    expect(xml).toContain('<clef-octave-change>-1</clef-octave-change>');
    expect(xml).toContain('<part-name>Guitarra</part-name>');
  });

  it('guitarra: solo la tablatura, sin el pentagrama de notas', () => {
    const t = toma('guitar', [40, 45, 50]);
    const xml = toMusicXml(buildScore(t, { beats: beatsOf(t), instrument: 'guitar' }), {
      instrument: 'guitar',
      soloTablatura: true,
    });
    expect(xml).toContain('<clef><sign>TAB</sign>');
    expect(xml).not.toContain('<staves>2</staves>');
    expect(xml).not.toContain('<backup>');
  });

  it('bajo: tablatura de 4 cuerdas con la nota grave en su cuerda', () => {
    const t = toma('bass', [33, 40]);
    const xml = toMusicXml(buildScore(t, { beats: beatsOf(t), instrument: 'bass' }), {
      instrument: 'bass',
    });
    expect(xml).toContain('<staff-lines>4</staff-lines>');
    // La 33 es la cuerda La (3) al aire; la 40, la cuerda Mi grave (4) en el traste 12 o la La en el 7.
    expect(xml).toContain('<string>3</string><fret>0</fret>');
    expect(xml).toContain('<part-name>Bajo</part-name>');
  });

  it('hoja vacía con varios compases', () => {
    const t = toma('guitar', []);
    const score = buildScore(t, { beats: beatsOf(t), instrument: 'guitar', compasesMinimos: 4 });
    expect(score.measures).toHaveLength(4);
  });

  it('batería: pentagrama de percusión con platillos en cruz', () => {
    const t = toma('drums', [36, 42, 38, 42]);
    const score = buildScore(t, { beats: beatsOf(t), instrument: 'drums' });
    const xml = toMusicXml(score, { instrument: 'drums' });
    expect(xml).toContain('<sign>percussion</sign>');
    expect(xml).toContain(
      '<unpitched><display-step>F</display-step><display-octave>4</display-octave></unpitched>',
    );
    expect(xml).toContain('<notehead>x</notehead>');
  });

  it('el piano sigue igual (dos pentagramas)', () => {
    const t = toma('piano', [60, 48]);
    const xml = toMusicXml(buildScore(t, { beats: beatsOf(t) }));
    expect(xml).toContain('<staves>2</staves>');
    expect(xml).toContain('<sign>F</sign><line>4</line>');
  });
});
