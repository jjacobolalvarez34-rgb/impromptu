import {
  AFINACIONES,
  asignarTrastes,
  createNoteEvent,
  createTake,
  createTrack,
  fitKeyboardRange,
  piezaDeNota,
} from '@impromptu/core';
import type { Instrument, NoteEvent, PedalEvent, Take } from '@impromptu/core';
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

/** Lo que cambia por instrumento al escribir cada nota. */
interface Escritura {
  /** <pitch> o <unpitched> de una altura. */
  altura?: (p: number) => string;
  /** <notehead> (por ejemplo, cruz en los platillos). */
  cabeza?: (p: number) => string;
  /** Contenido de <technical> (cuerda y traste en la tablatura). */
  tecnica?: (p: number) => string;
}

function noteXml(e: ScoreEvent, staff: 1 | 2, fifths: number, escritura: Escritura = {}): string {
  const voice = staff === 1 ? 1 : 5;
  const common = (
    chord: boolean,
    pitch: string,
    tieStart: boolean,
    tieStop: boolean,
    cabeza = '',
    tecnica = '',
  ) => {
    const ties = (tieStop ? '<tie type="stop"/>' : '') + (tieStart ? '<tie type="start"/>' : '');
    const tied = (tieStop ? '<tied type="stop"/>' : '') + (tieStart ? '<tied type="start"/>' : '');
    const tuplet = !chord && e.tuplet ? `<tuplet type="${e.tuplet}" bracket="yes"/>` : '';
    const tec = tecnica ? `<technical>${tecnica}</technical>` : '';
    const notations = tied || tuplet || tec ? `<notations>${tied}${tuplet}${tec}</notations>` : '';
    return (
      `<note>${chord ? '<chord/>' : ''}${pitch}<duration>${e.duration}</duration>${ties}` +
      `<voice>${voice}</voice><type>${e.type}</type>${'<dot/>'.repeat(e.dots)}` +
      (e.triplet
        ? '<time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification>'
        : '') +
      cabeza +
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
      const pitch =
        escritura.altura?.(p) ??
        `<pitch><step>${step}</step>${alter ? `<alter>${alter}</alter>` : ''}<octave>${octave}</octave></pitch>`;
      return common(
        i > 0,
        pitch,
        e.tieStart,
        e.tieStop,
        escritura.cabeza?.(p) ?? '',
        escritura.tecnica?.(p) ?? '',
      );
    })
    .join('');
}

/** Cabecera común del MusicXML. */
function documento(score: Score, parte: string, compases: string[]): string {
  return (
    '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' +
    '<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\n' +
    '<score-partwise version="4.0">' +
    `<work><work-title>${esc(score.title)}</work-title></work>` +
    '<identification><encoding><software>Impromptu</software></encoding></identification>' +
    `<part-list><score-part id="P1"><part-name>${parte}</part-name></score-part></part-list>` +
    `<part id="P1">${compases.join('')}</part></score-partwise>\n`
  );
}

const metronomo = (score: Score) =>
  '<direction placement="above"><direction-type><metronome><beat-unit>quarter</beat-unit>' +
  `<per-minute>${Math.round(score.bpm)}</per-minute></metronome></direction-type>` +
  `<staff>1</staff><sound tempo="${Math.round(score.bpm)}"/></direction>`;

const NOMBRES = ['C', 'C', 'D', 'D', 'E', 'F', 'F', 'G', 'G', 'A', 'A', 'B'];
const ALTERADAS = new Set([1, 3, 6, 8, 10]);

/**
 * MusicXML de guitarra o bajo (fase 9): pentagrama en clave de sol octava baja y, debajo, la
 * tablatura con cuerda y traste. Las posiciones salen del mismo algoritmo de la app
 * (`asignarTrastes`), aplicado a la partitura cuantizada.
 */
function guitarraXml(
  score: Score,
  afinacion: readonly number[],
  bajo: boolean,
  /** Solo la tablatura, sin el pentagrama de notas (pedido de Jacobo). */
  soloTab = false,
): string {
  const measureLength = Math.round(score.time[0] * (4 / score.time[1]) * score.divisions);
  // Posición de cada altura de cada evento.
  const pseudo: NoteEvent[] = [];
  score.measures.forEach((m, mi) =>
    m.staves[0].forEach((e, ei) =>
      e.pitches.forEach((p, k) => {
        const start = (mi * measureLength + e.start) / score.divisions;
        pseudo.push(
          createNoteEvent(
            { pitch: p, start, end: start + 0.1, velocity: 80, origin: 'edit' },
            () => `${mi}-${ei}-${k}`,
          ),
        );
      }),
    ),
  );
  const pos = new Map(asignarTrastes(pseudo, afinacion).map((n) => [n.id, n]));
  const lineas = afinacion.length;
  // Afinación en la tablatura: la línea 1 es la cuerda más grave.
  const afinacionXml = [...afinacion]
    .reverse()
    .map((p, i) => {
      const nombre = NOMBRES[p % 12]!;
      const alter = ALTERADAS.has(p % 12) ? '<tuning-alter>1</tuning-alter>' : '';
      return `<staff-tuning line="${i + 1}"><tuning-step>${nombre}</tuning-step>${alter}<tuning-octave>${Math.floor(p / 12) - 1}</tuning-octave></staff-tuning>`;
    })
    .join('');
  const compases = score.measures.map((m, mi) => {
    const attributes =
      mi === 0
        ? `<attributes><divisions>${score.divisions}</divisions>` +
          `<key><fifths>${score.fifths}</fifths><mode>${score.mode}</mode></key>` +
          `<time><beats>${score.time[0]}</beats><beat-type>${score.time[1]}</beat-type></time>` +
          (soloTab
            ? '<clef><sign>TAB</sign><line>5</line></clef>' +
              `<staff-details><staff-lines>${lineas}</staff-lines>${afinacionXml}</staff-details></attributes>`
            : '<staves>2</staves>' +
              (bajo
                ? '<clef number="1"><sign>F</sign><line>4</line><clef-octave-change>-1</clef-octave-change></clef>'
                : '<clef number="1"><sign>G</sign><line>2</line><clef-octave-change>-1</clef-octave-change></clef>') +
              '<clef number="2"><sign>TAB</sign><line>5</line></clef>' +
              `<staff-details number="2"><staff-lines>${lineas}</staff-lines>${afinacionXml}</staff-details></attributes>`) +
          metronomo(score)
        : '';
    const notas = m.staves[0].map((e) => noteXml(e, 1, score.fifths)).join('');
    const tab = m.staves[0]
      .map((e, ei) => {
        const tecnica = (p: number) => {
          const k = e.pitches.indexOf(p);
          const n = pos.get(`${mi}-${ei}-${k}`);
          return n?.string !== undefined
            ? `<string>${n.string}</string><fret>${n.fret}</fret>`
            : '';
        };
        return noteXml(e, soloTab ? 1 : 2, score.fifths, { tecnica });
      })
      .join('');
    if (soloTab) return `<measure number="${m.number}">${attributes}${tab}</measure>`;
    return (
      `<measure number="${m.number}">${attributes}${notas}` +
      `<backup><duration>${measureLength}</duration></backup>${tab}</measure>`
    );
  });
  return documento(score, bajo ? 'Bajo' : 'Guitarra', compases);
}

/** MusicXML de batería (fase 9): pentagrama de percusión, cada pieza en su lugar y los platillos con cruz. */
function bateriaXml(score: Score): string {
  const escritura: Escritura = {
    altura: (p) => {
      const pieza = piezaDeNota(p);
      return `<unpitched><display-step>${pieza?.paso ?? 'C'}</display-step><display-octave>${pieza?.octava ?? 5}</display-octave></unpitched>`;
    },
    cabeza: (p) => (piezaDeNota(p)?.cruz ? '<notehead>x</notehead>' : ''),
  };
  const compases = score.measures.map((m, mi) => {
    const attributes =
      mi === 0
        ? `<attributes><divisions>${score.divisions}</divisions><key><fifths>0</fifths></key>` +
          `<time><beats>${score.time[0]}</beats><beat-type>${score.time[1]}</beat-type></time>` +
          '<clef><sign>percussion</sign></clef></attributes>' +
          metronomo(score)
        : '';
    return `<measure number="${m.number}">${attributes}${m.staves[0].map((e) => noteXml(e, 1, 0, escritura)).join('')}</measure>`;
  });
  return documento(score, 'Batería', compases);
}

/**
 * MusicXML 4.0 (score-partwise) de la partitura. Piano: dos pentagramas; guitarra y bajo:
 * pentagrama y tablatura; batería: pentagrama de percusión.
 */
export function toMusicXml(
  score: Score,
  opciones: {
    instrument?: Instrument;
    afinacion?: readonly number[];
    soloTablatura?: boolean;
  } = {},
): string {
  const instrumento = opciones.instrument ?? 'piano';
  if (instrumento === 'guitar')
    return guitarraXml(
      score,
      opciones.afinacion ?? AFINACIONES.estandar,
      false,
      opciones.soloTablatura,
    );
  if (instrumento === 'bass')
    return guitarraXml(score, opciones.afinacion ?? AFINACIONES.bajo, true, opciones.soloTablatura);
  if (instrumento === 'drums') return bateriaXml(score);
  return pianoXml(score);
}

function pianoXml(score: Score): string {
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
  return documento(score, 'Piano', measures);
}

/**
 * Toma cuantizada: las notas como están escritas en la partitura (tempo fijo, ligaduras
 * unidas), para exportar un MIDI "limpio" que cualquier editor de partituras lee igual.
 */
export function quantizedTake(score: Score, instrument: Instrument = 'piano'): Take {
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
          if (instrument === 'piano') {
            n.hand = staff === 0 ? 'R' : 'L';
            n.handSource = 'auto';
          }
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
    tracks: [
      createTrack({
        instrument,
        name: instrument === 'piano' ? 'Piano' : 'Pieza',
        notes,
        pedals: instrument === 'piano' ? pedals : [],
      }),
    ],
    tempoMap: [{ time: 0, bpm: score.bpm }],
    timeSignature: score.time,
    duration: score.measures.length * measureLength * secondsPerDiv,
    keyboardRange: fitKeyboardRange(notes.map((n) => n.pitch)),
  });
}
