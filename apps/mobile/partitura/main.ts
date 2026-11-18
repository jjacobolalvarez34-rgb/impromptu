/**
 * Partitura dentro de la app de Android (ADR-019): el mismo paquete de notación de la web y
 * OpenSheetMusicDisplay, en un WebView. Kotlin llama a `impromptu.mostrar` con la pieza y
 * recibe avisos por `Puente` (interfaz de JavaScript de Android).
 */
import { createNoteEvent, createTake, createTrack, fitKeyboardRange } from '@impromptu/core';
import type { PedalKind, Take } from '@impromptu/core';
import { beatsOf, buildScore, toMusicXml } from '@impromptu/notation';
import type { Score } from '@impromptu/notation';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

interface PiezaWeb {
  title: string;
  duration: number;
  notes: { pitch: number; start: number; end: number; velocity: number }[];
  pedals: { kind: PedalKind; time: number; value: number }[];
}

interface Puente {
  listo(bpm: number): void;
  error(mensaje: string): void;
}

const puente = (globalThis as unknown as { Puente?: Puente }).Puente;
let vista: OpenSheetMusicDisplay | null = null;
let partitura: Score | null = null;
let xml = '';

function aTake(p: PiezaWeb): Take {
  const notes = p.notes.map((n) => createNoteEvent({ ...n, origin: 'midi-file' }));
  return createTake({
    title: p.title,
    tracks: [createTrack({ name: 'Piano', notes, pedals: p.pedals })],
    duration: p.duration,
    keyboardRange: fitKeyboardRange(notes.map((n) => n.pitch)),
  });
}

async function mostrar(pieza: PiezaWeb, compas: string): Promise<void> {
  try {
    const take = aTake(pieza);
    const beats = beatsOf(take);
    const [n, d] = compas.split('/').map(Number) as [number, number];
    partitura = buildScore(take, { beats, timeSignature: [n, d] });
    xml = toMusicXml(partitura);
    const el = document.getElementById('partitura')!;
    el.innerHTML = '';
    vista = new OpenSheetMusicDisplay(el, {
      autoResize: true,
      backend: 'svg',
      drawTitle: true,
      drawPartNames: false,
      followCursor: true,
    });
    await vista.load(xml);
    vista.render();
    vista.cursor.show();
    puente?.listo(Math.round(partitura.bpm));
  } catch (e) {
    puente?.error(e instanceof Error ? e.message : String(e));
  }
}

let ultimo = -1;

/** Lleva el cursor al segundo `t` de la pieza (Kotlin lo llama mientras suena). */
function cursor(t: number): void {
  const v = vista;
  const s = partitura;
  if (!v || !s) return;
  const negras = s.time[0] * (4 / s.time[1]);
  let m = 0;
  while (m + 1 < s.measureTimes.length && s.measureTimes[m + 1]! <= t) m++;
  const inicio = s.measureTimes[m]!;
  const fin = s.measureTimes[m + 1] ?? inicio + (60 / s.bpm) * negras;
  const frac = Math.min(0.999, Math.max(0, (t - inicio) / Math.max(1e-6, fin - inicio)));
  const objetivo = ((m + frac) * negras) / 4;
  if (Math.abs(objetivo - ultimo) < 1e-4) return;
  const c = v.cursor;
  const ahora = () => c.Iterator.currentTimeStamp.RealValue;
  if (ahora() > objetivo + 1e-6) c.reset();
  while (!c.Iterator.EndReached) {
    c.next();
    if (ahora() > objetivo + 1e-6) {
      c.previous();
      break;
    }
  }
  ultimo = objetivo;
}

(globalThis as unknown as Record<string, unknown>).impromptu = {
  mostrar: (json: string, compas: string) => void mostrar(JSON.parse(json) as PiezaWeb, compas),
  cursor,
  musicxml: () => xml,
};
