/**
 * Partitura dentro de la app de Android (ADR-019): el mismo paquete de notación de la web y
 * OpenSheetMusicDisplay, en un WebView. Kotlin llama a `impromptu.mostrar` con la pieza y
 * recibe avisos por `Puente` (interfaz de JavaScript de Android).
 */
import { createNoteEvent, createTake, createTrack, fitKeyboardRange } from '@impromptu/core';
import type { Instrument, PedalKind, Take } from '@impromptu/core';
import {
  LineaDeLectura,
  aRedondas,
  beatsOf,
  buildScore,
  BarraEdicion,
  editar,
  hacerSeleccionable,
  leerRecorrido,
  marcarSeleccion,
  toMusicXml,
} from '@impromptu/notation';
import type { Edicion, Score, Seleccion } from '@impromptu/notation';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

interface PiezaWeb {
  title: string;
  duration: number;
  /** Fase 9: piano, guitar, bass o drums. */
  instrument?: Instrument;
  notes: {
    pitch: number;
    start: number;
    end: number;
    velocity: number;
    string?: number;
    fret?: number;
    hand?: 'L' | 'R';
  }[];
  pedals: { kind: PedalKind; time: number; value: number }[];
}

interface Puente {
  listo(bpm: number): void;
  error(mensaje: string): void;
  /** La pieza editada en la hoja (fase 10), para que Kotlin la guarde. */
  guardar?(json: string): void;
}

const puente = (globalThis as unknown as { Puente?: Puente }).Puente;
let vista: OpenSheetMusicDisplay | null = null;
let partitura: Score | null = null;
let xml = '';
let linea: LineaDeLectura | null = null;

function aTake(p: PiezaWeb): Take {
  const notes = p.notes.map((n) => {
    const { hand, ...resto } = n;
    const nota = createNoteEvent({ ...resto, origin: 'midi-file' });
    if (hand) {
      nota.hand = hand;
      nota.handSource = 'user';
    }
    return nota;
  });
  return createTake({
    title: p.title,
    tracks: [
      createTrack({
        instrument: p.instrument ?? 'piano',
        name: 'Pieza',
        notes,
        pedals: p.instrument && p.instrument !== 'piano' ? [] : p.pedals,
      }),
    ],
    duration: p.duration,
    keyboardRange: fitKeyboardRange(notes.map((n) => n.pitch)),
  });
}

// Lo que se muestra y se edita.
let actual: Take | null = null;
let instrumento: Instrument = 'piano';
let compasActual: [number, number] = [4, 4];
let soloTab = false;
let seleccion: Seleccion | null = null;
const historial: Take[] = [];
const futuro: Take[] = [];
let quitarClics: (() => void) | null = null;
let barra: BarraEdicion | null = null;

async function dibujar(take: Take): Promise<void> {
  const beats = beatsOf(take);
  partitura = buildScore(take, { beats, timeSignature: compasActual, instrument: instrumento });
  xml = toMusicXml(partitura, { instrument: instrumento, soloTablatura: soloTab });
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
  // Editor (fase 10): tocar una nota de la hoja la elige.
  quitarClics?.();
  quitarClics = hacerSeleccionable(
    vista as unknown as Parameters<typeof hacerSeleccionable>[0],
    partitura,
    instrumento,
    (sel) => elegir(sel),
  );
  marcarSeleccion(el, seleccion);
}

function elegir(sel: Seleccion | null): void {
  seleccion = sel;
  barra?.mostrar(sel);
  marcarSeleccion(document.getElementById('partitura')!, sel);
}

/** La pieza editada vuelve a Kotlin, que la guarda (y el visualizador y el sonido la siguen). */
function guardar(take: Take): void {
  const notas = take.tracks.flatMap((t) =>
    t.notes.map((n) => ({
      pitch: n.pitch,
      start: n.start,
      end: n.end,
      velocity: n.velocity,
      ...(n.string !== undefined ? { string: n.string, fret: n.fret } : {}),
      ...(n.hand ? { hand: n.hand } : {}),
    })),
  );
  const pedales = take.tracks.flatMap((t) => t.pedals);
  puente?.guardar?.(JSON.stringify({ notes: notas, pedals: pedales }));
}

async function aplicar(ed: Edicion): Promise<void> {
  if (!actual || !partitura || !seleccion) return;
  const r = editar(actual, partitura, seleccion, ed, instrumento);
  historial.push(actual);
  futuro.length = 0;
  actual = r.take;
  seleccion = r.seleccion;
  await dibujar(actual);
  elegir(seleccion);
  guardar(actual);
}

async function moverHistoria(desde: Take[], hacia: Take[]): Promise<void> {
  const t = desde.pop();
  if (!t || !actual) return;
  hacia.push(actual);
  actual = t;
  elegir(null);
  await dibujar(actual);
  guardar(actual);
}

async function mostrar(pieza: PiezaWeb, compas: string, soloTablatura = false): Promise<void> {
  try {
    instrumento = pieza.instrument ?? 'piano';
    compasActual = compas.split('/').map(Number) as [number, number];
    soloTab = soloTablatura;
    actual = aTake(pieza);
    historial.length = 0;
    futuro.length = 0;
    barra?.quitar();
    barra = new BarraEdicion(
      document.body,
      instrumento,
      (ed) => void aplicar(ed),
      () => elegir(null),
      () => void moverHistoria(historial, futuro),
      () => void moverHistoria(futuro, historial),
    );
    elegir(null);
    await dibujar(actual);
    puente?.listo(Math.round(partitura!.bpm));
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
  mostrar: (json: string, compas: string, soloTab?: boolean) =>
    void mostrar(JSON.parse(json) as PiezaWeb, compas, soloTab === true),
  reloj,
  musicxml: () => xml,
};
