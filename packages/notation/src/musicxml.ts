import { createNoteEvent, createTake, createTrack, fitKeyboardRange } from '@impromptu/core';
import type { NoteEvent, PedalEvent, Take } from '@impromptu/core';
import { spell } from './key';
import type { Score, ScoreEvent } from './score';

/**
 * Pedal con línea (moderno y legible con cambios rápidos): "Ped." al pisar, línea mientras está
 * abajo, muesca en cada cambio y gancho al soltar.
 */
const pedalXml = (type: 'start' | 'stop' | 'change') =>
  `<pedal type="${type}" line="yes" sign="${type === 'start' ? 'yes' : 'no'}"/></direction-type>`;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function noteXml(e: ScoreEvent, staff: 1 | 2, fifths: number): string {
  const voice = staff === 1 ? 1 : 5;
  const common = (chord: boolean, pitch: string, tieStart: boolean, tieStop: boolean) => {
    const ties = (tieStop ? '<tie type="stop"/>' : '') + (tieStart ? '<tie type="start"/>' : '');
    const tied = (tieStop ? '<tied type="stop"/>' : '') + (tieStart ? '<tied type="start"/>' : '');
    const tuplet = !chord && e.tuplet ? `<tuplet type="${e.tuplet}" bracket="yes"/>` : '';
    const notations = tied || tuplet ? `<notations>${tied}${tuplet}</notations>` : '';
    return (
      `<note>${chord ? '<chord/>' : ''}${pitch}<duration>${e.duration}</duration>${ties}` +
      `<voice>${voice}</voice><type>${e.type}</type>${'<dot/>'.repeat(e.dots)}` +
      (e.triplet
        ? '<time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification>'
        : '') +
      `<staff>${staff}</staff>${notations}</note>`
    );
  };
  if (e.pitches.length === 0) {
    const rest = e.wholeMeasure ? '<rest measure="yes"/>' : '<rest/>';
    return (
      `<note>${rest}<duration>${e.duration}</duration><voice>${voice}</voice>` +
      (e.wholeMeasure ? '' : `<type>${e.type}</type>${'<dot/>'.repeat(e.dots)}`) +
      (e.triplet && !e.wholeMeasure
        ? '<time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification>'
        : '') +
      `<staff>${staff}</staff>` +
      (e.tuplet ? `<notations><tuplet type="${e.tuplet}" bracket="yes"/></notations>` : '') +
      '</note>'
    );
  }
  return e.pitches
    .map((p, i) => {
      const { step, alter, octave } = spell(p, fifths);
      const pitch = `<pitch><step>${step}</step>${alter ? `<alter>${alter}</alter>` : ''}<octave>${octave}</octave></pitch>`;
      return common(i > 0, pitch, e.tieStart, e.tieStop);
    })
    .join('');
}

/** MusicXML 4.0 (score-partwise) de la partitura: un piano con dos pentagramas. */
export function toMusicXml(score: Score): string {
  const measureLength = Math.round(score.time[0] * (4 / score.time[1]) * score.divisions);
  const measures = score.measures.map((m, idx) => {
    const attributes =
      idx === 0
        ? `<attributes><divisions>${score.divisions}</divisions>` +
          `<key><fifths>${score.fifths}</fifths><mode>${score.mode}</mode></key>` +
          `<time><beats>${score.time[0]}</beats><beat-type>${score.time[1]}</beat-type></time>` +
          '<staves>2</staves><clef number="1"><sign>G</sign><line>2</line></clef>' +
          '<clef number="2"><sign>F</sign><line>4</line></clef></attributes>' +
          '<direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit>' +
          `<per-minute>${Math.round(score.bpm)}</per-minute></metronome></direction-type>` +
          `<staff>1</staff><sound tempo="${Math.round(score.bpm)}"/></direction>`
        : '';
    const right = m.staves[0].map((e) => noteXml(e, 1, score.fifths)).join('');
    // Mano izquierda con las marcas de pedal intercaladas en su posición.
    let left = '';
    let pos = 0;
    const pedals = [...m.pedals];
    for (const e of m.staves[1]) {
      while (pedals.length > 0 && pedals[0]!.position < e.start + e.duration) {
        const p = pedals.shift()!;
        const offset = p.position - pos;
        left +=
          '<direction placement="below"><direction-type>' +
          pedalXml(p.type) +
          (offset !== 0 ? `<offset>${offset}</offset>` : '') +
          '<staff>2</staff></direction>';
      }
      left += noteXml(e, 2, score.fifths);
      pos = e.start + e.duration;
    }
    for (const p of pedals) {
      left +=
        '<direction placement="below"><direction-type>' +
        pedalXml(p.type) +
        `<offset>${p.position - pos}</offset><staff>2</staff></direction>`;
    }
    return (
      `<measure number="${m.number}">${attributes}${right}` +
      `<backup><duration>${measureLength}</duration></backup>${left}</measure>`
    );
  });
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' +
    '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\n' +
    '<score-partwise version="4.0">' +
    `<work><work-title>${esc(score.title)}</work-title></work>` +
    '<identification><encoding><software>Impromptu</software></encoding></identification>' +
    '<part-list><score-part id="P1"><part-name>Piano</part-name></score-part></part-list>' +
    `<part id="P1">${measures.join('')}</part></score-partwise>\n`
  );
}

/**
 * Toma cuantizada: las notas como están escritas en la partitura (tempo fijo, ligaduras
 * unidas), para exportar un MIDI "limpio" que cualquier editor de partituras lee igual.
 */
export function quantizedTake(score: Score): Take {
  const measureLength = Math.round(score.time[0] * (4 / score.time[1]) * score.divisions);
  const secondsPerDiv = 60 / score.bpm / score.divisions;
  const notes: NoteEvent[] = [];
  const pedals: PedalEvent[] = [];
  score.measures.forEach((m, mi) => {
    const base = mi * measureLength;
    m.staves.forEach((events, staff) => {
      for (const e of events) {
        for (const pitch of e.pitches) {
          const start = (base + e.start) * secondsPerDiv;
          const end = (base + e.start + e.duration) * secondsPerDiv;
          if (e.tieStop) {
            // Continúa una nota ligada: se alarga la anterior de esa tecla.
            const prev = [...notes].reverse().find((n) => n.pitch === pitch);
            if (prev) {
              prev.end = end;
              continue;
            }
          }
          const n = createNoteEvent({ pitch, start, end, velocity: 80, origin: 'edit' });
          n.hand = staff === 0 ? 'R' : 'L';
          n.handSource = 'auto';
          notes.push(n);
        }
      }
    });
    for (const p of m.pedals) {
      pedals.push({
        kind: 'sustain',
        time: (base + p.position) * secondsPerDiv,
        value: p.type === 'start' ? 127 : 0,
      });
    }
  });
  notes.sort((a, b) => a.start - b.start || a.pitch - b.pitch);
  return createTake({
    title: score.title,
    tracks: [createTrack({ name: 'Piano', notes, pedals })],
    tempoMap: [{ time: 0, bpm: score.bpm }],
    timeSignature: score.time,
    duration: score.measures.length * measureLength * secondsPerDiv,
    keyboardRange: fitKeyboardRange(notes.map((n) => n.pitch)),
  });
}
