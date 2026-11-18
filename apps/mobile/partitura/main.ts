/**
 * Partitura dentro de la app de Android (ADR-019): el mismo paquete de notación de la web y
 * OpenSheetMusicDisplay, en un WebView. Kotlin llama a `impromptu.mostrar` con la pieza y
 * recibe avisos por `Puente` (interfaz de JavaScript de Android).
 */
import { createNoteEvent, createTake, createTrack, fitKeyboardRange } from '@impromptu/core';
import type { PedalKind, Take } from '@impromptu/core';
import {
  LineaDeLectura,
  aRedondas,
  beatsOf,
  buildScore,
  leerRecorrido,
  toMusicXml,
} from '@impromptu/notation';
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
let linea: LineaDeLectura | null = null;

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
    linea?.quitar();
    linea = new LineaDeLectura(
      el,
      document.scrollingElement as HTMLElement,
      leerRecorrido(vista.cursor),
    );
    linea.mover(0);
    puente?.listo(Math.round(partitura.bpm));
  } catch (e) {
    puente?.error(e instanceof Error ? e.message : String(e));
  }
}

// Reloj: Kotlin avisa el segundo de la pieza unas 4 veces por segundo; entre avisos se
// extrapola, así la línea se mueve en cada cuadro (60 fps) sin saltos.
let base = 0;
let baseMs = performance.now();
let tocando = false;
let velocidad = 1;

function reloj(t: number, suena: boolean, vel: number): void {
  base = t;
  baseMs = performance.now();
  tocando = suena;
  velocidad = vel;
}

function cuadro(): void {
  const s = partitura;
  if (linea && s) {
    const t = tocando ? base + ((performance.now() - baseMs) / 1000) * velocidad : base;
    linea.mover(aRedondas(t, s.measureTimes, s.bpm, s.time));
  }
  requestAnimationFrame(cuadro);
}
requestAnimationFrame(cuadro);

(globalThis as unknown as Record<string, unknown>).impromptu = {
  mostrar: (json: string, compas: string) => void mostrar(JSON.parse(json) as PiezaWeb, compas),
  reloj,
  musicxml: () => xml,
};
