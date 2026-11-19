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
  posicionEn,
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
  /**
   * Video de la partitura (fase 10): la hoja como PNG en base64, su tamaño en px de la hoja y,
   * por cada cuadro, dónde va la línea (x, y, alto; NaN antes de empezar).
   */
  hoja?(png: string, ancho: number, alto: number, cursor: string): void;
  errorVideo?(mensaje: string): void;
}

const puente = (globalThis as unknown as { Puente?: Puente }).Puente;
let vista: OpenSheetMusicDisplay | null = null;
let partitura: Score | null = null;
let xml = '';
let linea: LineaDeLectura | null = null;
let recorrido: ReturnType<typeof leerRecorrido> | null = null;

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

async function dibujar(take: Take, editable = true): Promise<void> {
  const beats = beatsOf(take);
  partitura = buildScore(take, {
    beats,
    timeSignature: compasActual,
    instrument: instrumento,
    ...(editable ? {} : { compasesMinimos: 4 }),
  });
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
  recorrido = leerRecorrido(vista.cursor);
  linea = new LineaDeLectura(el, document.scrollingElement as HTMLElement, recorrido);
  linea.mover(0);
  quitarClics?.();
  quitarClics = null;
  if (!editable) return;
  // Editor (fase 10): tocar una nota de la hoja la elige.
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

/**
 * Grabar directo en la partitura (fase 10): Kotlin manda lo grabado cada segundo y la hoja se
 * reescribe sin editor; la vista baja hasta lo último que se tocó.
 */
let dibujandoEnVivo = false;
async function enVivo(pieza: PiezaWeb, compas: string): Promise<void> {
  if (dibujandoEnVivo) return; // si un dibujo tarda, se salta este aviso
  dibujandoEnVivo = true;
  try {
    instrumento = pieza.instrument ?? 'piano';
    compasActual = compas.split('/').map(Number) as [number, number];
    soloTab = false;
    barra?.quitar();
    barra = null;
    seleccion = null;
    actual = aTake(pieza);
    await dibujar(actual, false);
    const caja = document.scrollingElement as HTMLElement;
    caja.scrollTo({ top: caja.scrollHeight });
    puente?.listo(Math.round(partitura!.bpm));
  } catch (e) {
    puente?.error(e instanceof Error ? e.message : String(e));
  } finally {
    dibujandoEnVivo = false;
  }
}

/** Ancho de la imagen de la hoja para el video (px); el alto sale de la proporción. */
const ANCHO_IMAGEN = 1600;
/** Cola del video: igual que el exportador (4 s con fundido). */
const COLA = 4;

/**
 * Prepara el video de la partitura: la hoja dibujada pasa a PNG y se anota dónde va la línea
 * en cada cuadro. Kotlin arma el video (mismo exportador del visualizador, con el audio).
 */
async function paraVideo(fps: number): Promise<void> {
  try {
    const el = document.getElementById('partitura')!;
    const svg = el.querySelector('svg');
    const s = partitura;
    const r = recorrido;
    if (!svg || !s || !r || !actual) throw new Error('La hoja todavía no está lista');
    linea?.quitar();
    const cajaSvg = svg.getBoundingClientRect();
    const cajaHoja = el.getBoundingClientRect();
    const dx = cajaSvg.left - cajaHoja.left;
    const dy = cajaSvg.top - cajaHoja.top;
    const texto = new XMLSerializer().serializeToString(svg);
    const url = URL.createObjectURL(new Blob([texto], { type: 'image/svg+xml' }));
    const imagen = new Image();
    await new Promise<void>((ok, mal) => {
      imagen.onload = () => ok();
      imagen.onerror = () => mal(new Error('No se pudo leer la hoja'));
      imagen.src = url;
    });
    URL.revokeObjectURL(url);
    const escala = ANCHO_IMAGEN / cajaSvg.width;
    const lienzo = document.createElement('canvas');
    lienzo.width = ANCHO_IMAGEN;
    lienzo.height = Math.ceil(cajaSvg.height * escala);
    const ctx = lienzo.getContext('2d')!;
    ctx.fillStyle = '#F7F3EA';
    ctx.fillRect(0, 0, lienzo.width, lienzo.height);
    ctx.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
    const png = lienzo.toDataURL('image/png').split(',')[1] ?? '';
    // La línea en cada cuadro, en px de la imagen.
    const cuadros = Math.ceil((actual.duration + COLA) * fps) + 1;
    const cursor = new Array<number>(cuadros * 3);
    for (let i = 0; i < cuadros; i++) {
      const pos = posicionEn(r.puntos, r.fines, aRedondas(i / fps, s.measureTimes, s.bpm, s.time));
      cursor[i * 3] = pos ? (pos.x - dx) * escala : -1;
      cursor[i * 3 + 1] = pos ? (pos.y - dy) * escala : -1;
      cursor[i * 3 + 2] = pos ? pos.alto * escala : -1;
    }
    linea = new LineaDeLectura(el, document.scrollingElement as HTMLElement, r);
    puente?.hoja?.(
      png,
      lienzo.width,
      lienzo.height,
      JSON.stringify(cursor.map((v) => Math.round(v * 10) / 10)),
    );
  } catch (e) {
    puente?.errorVideo?.(e instanceof Error ? e.message : String(e));
  }
}

(globalThis as unknown as Record<string, unknown>).impromptu = {
  paraVideo: (fps: number) => void paraVideo(fps),
  enVivo: (json: string, compas: string) => void enVivo(JSON.parse(json) as PiezaWeb, compas),
  mostrar: (json: string, compas: string, soloTab?: boolean) =>
    void mostrar(JSON.parse(json) as PiezaWeb, compas, soloTab === true),
  reloj,
  musicxml: () => xml,
};
