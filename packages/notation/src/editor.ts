/**
 * Editor de partitura (fase 10). Se toca una nota en la hoja (o un silencio) y aparece una barra
 * pequeña para cambiarla: altura, figura, puntillo, borrar, poner una nota en un silencio, mano
 * (piano) o cuerda (guitarra y bajo). Lo mismo para web, PC y celular: la lógica es pura (toma →
 * toma) y la barra es DOM simple.
 *
 * Al primer cambio la pieza toma el ritmo escrito (quantizedTake): así la hoja, el visualizador,
 * el sonido y el MIDI dicen lo mismo. Las ediciones siguientes ya caen sobre la rejilla.
 */
import {
  AFINACIONES,
  PIEZAS_BATERIA,
  asignarTrastes,
  createNoteEvent,
  posiciones,
} from '@impromptu/core';
import type { Instrument, NoteEvent, Take } from '@impromptu/core';
import { quantizedTake } from './musicxml';
import { DIV } from './score';
import type { Score } from './score';

/** Lo que se tocó en la hoja. `tecla` null = un silencio. */
export interface Seleccion {
  compas: number;
  /** 0 = arriba (mano derecha, o el único pentagrama); 1 = abajo (mano izquierda en piano). */
  pentagrama: 0 | 1;
  /** Posición dentro del compás (divisiones). */
  inicio: number;
  duracion: number;
  tecla: number | null;
}

export type Edicion =
  | { tipo: 'altura'; semitonos: number }
  | { tipo: 'figura'; divisiones: number }
  | { tipo: 'borrar' }
  | { tipo: 'poner' }
  | { tipo: 'mano' }
  | { tipo: 'cuerda'; delta: 1 | -1 };

/** Figuras: redonda, blanca, negra, corchea y semicorchea (en divisiones). */
export const FIGURAS = [
  { nombre: 'Redonda', divisiones: DIV * 4, tecla: '1' },
  { nombre: 'Blanca', divisiones: DIV * 2, tecla: '2' },
  { nombre: 'Negra', divisiones: DIV, tecla: '3' },
  { nombre: 'Corchea', divisiones: DIV / 2, tecla: '4' },
  { nombre: 'Semicorchea', divisiones: DIV / 4, tecla: '5' },
] as const;

const NOMBRES = ['Do', 'Do♯', 'Re', 'Mi♭', 'Mi', 'Fa', 'Fa♯', 'Sol', 'La♭', 'La', 'Si♭', 'Si'];
export const nombreNota = (p: number) => `${NOMBRES[p % 12]}${Math.floor(p / 12) - 1}`;

const largoCompas = (score: Score) =>
  Math.round(score.time[0] * (4 / score.time[1]) * score.divisions);

/**
 * Aplica una edición. Devuelve la toma nueva (mismo id, título y medios) y la selección que
 * queda (la nota movida sigue elegida).
 */
export function editar(
  take: Take,
  score: Score,
  sel: Seleccion,
  ed: Edicion,
  instrumento: Instrument = 'piano',
  afinacion?: readonly number[],
): { take: Take; seleccion: Seleccion | null } {
  // 1. Ritmo escrito: la toma pasa a ser la de la hoja.
  const base = quantizedTake(score, instrumento);
  const porDiv = 60 / score.bpm / score.divisions;
  const t0 = (sel.compas * largoCompas(score) + sel.inicio) * porDiv;
  const cerca = (a: number, b: number) => Math.abs(a - b) < porDiv * 0.5;
  const enPentagrama = (n: NoteEvent) =>
    instrumento !== 'piano' || (sel.pentagrama === 0 ? n.hand !== 'L' : n.hand === 'L');
  let notas = base.tracks.flatMap((t) => t.notes);
  // Lo que ya tenía cada nota (cuerda y traste, dedo, mano puesta a mano) se conserva: se busca la
  // original de la misma tecla que empezaba ahí.
  const originales = take.tracks.flatMap((t) => t.notes);
  for (const n of notas) {
    const o = originales.find(
      (x) => x.pitch === n.pitch && Math.abs(x.start - n.start) < porDiv * 1.5,
    );
    if (!o) continue;
    if (o.string !== undefined) n.string = o.string;
    if (o.fret !== undefined) n.fret = o.fret;
    if (o.finger !== null) {
      n.finger = o.finger;
      n.fingerSource = o.fingerSource;
    }
    if (o.handSource === 'user') {
      n.hand = o.hand;
      n.handSource = 'user';
    }
  }
  // Las notas del acorde (o la nota) que se tocó.
  const delEvento = notas.filter((n) => cerca(n.start, t0) && enPentagrama(n));
  const elegidas = sel.tecla === null ? [] : delEvento.filter((n) => n.pitch === sel.tecla);
  let nueva: Seleccion | null = sel;
  const cambiadas = new Set<string>();

  switch (ed.tipo) {
    case 'altura': {
      // Batería: pasa a la pieza siguiente o anterior del kit (no tiene alturas).
      const mover = (p: number) => {
        if (instrumento !== 'drums') return Math.min(127, Math.max(0, p + ed.semitonos));
        const i = PIEZAS_BATERIA.findIndex((x) => x.nota === p || x.otras.includes(p));
        const j = (i + Math.sign(ed.semitonos) + PIEZAS_BATERIA.length) % PIEZAS_BATERIA.length;
        return PIEZAS_BATERIA[j]!.nota;
      };
      for (const n of elegidas) {
        n.pitch = mover(n.pitch);
        cambiadas.add(n.id);
      }
      if (sel.tecla !== null) nueva = { ...sel, tecla: mover(sel.tecla) };
      break;
    }
    case 'figura': {
      const objetivo = elegidas.length ? delEvento : delEvento; // la figura es de todo el acorde
      const fin = t0 + ed.divisiones * porDiv;
      for (const n of objetivo) n.end = fin;
      // Lo que empezaba dentro del nuevo largo, en el mismo pentagrama, se pisa.
      notas = notas.filter(
        (n) => !(enPentagrama(n) && n.start > t0 + porDiv * 0.5 && n.start < fin - porDiv * 0.5),
      );
      nueva = { ...sel, duracion: ed.divisiones };
      break;
    }
    case 'borrar': {
      const fuera = new Set((elegidas.length ? elegidas : delEvento).map((n) => n.id));
      notas = notas.filter((n) => !fuera.has(n.id));
      nueva = null;
      break;
    }
    case 'poner': {
      const tecla =
        instrumento === 'drums'
          ? 38
          : instrumento === 'guitar'
            ? 64
            : instrumento === 'bass'
              ? 40
              : sel.pentagrama === 0
                ? 72
                : 52;
      const n = createNoteEvent({
        pitch: tecla,
        start: t0,
        end: t0 + Math.min(sel.duracion, DIV) * porDiv,
        velocity: 80,
        origin: 'edit',
      });
      if (instrumento === 'piano') {
        n.hand = sel.pentagrama === 0 ? 'R' : 'L';
        n.handSource = 'user';
      }
      notas.push(n);
      cambiadas.add(n.id);
      nueva = { ...sel, tecla, duracion: Math.min(sel.duracion, DIV) };
      break;
    }
    case 'mano': {
      for (const n of elegidas.length ? elegidas : delEvento) {
        n.hand = n.hand === 'L' ? 'R' : 'L';
        n.handSource = 'user';
      }
      nueva = { ...sel, pentagrama: sel.pentagrama === 0 ? 1 : 0 };
      break;
    }
    case 'cuerda': {
      // La misma nota en la cuerda siguiente (o anterior) donde quepa.
      const afi = afinacion ?? (instrumento === 'bass' ? AFINACIONES.bajo : AFINACIONES.estandar);
      for (const n of elegidas) {
        const ops = posiciones(n.pitch, afi);
        const i = ops.findIndex((p) => p.string === n.string);
        const otra = ops[(i + ed.delta + ops.length) % ops.length];
        if (otra) {
          n.string = otra.string;
          n.fret = otra.fret;
        }
      }
      break;
    }
  }

  // Guitarra y bajo: las notas cambiadas buscan cuerda y traste de nuevo; las demás se respetan.
  if (instrumento === 'guitar' || instrumento === 'bass') {
    const afi = afinacion ?? (instrumento === 'bass' ? AFINACIONES.bajo : AFINACIONES.estandar);
    const sin = notas.map((n) => {
      if (!cambiadas.has(n.id)) return n;
      const copia = { ...n };
      delete copia.string;
      delete copia.fret;
      return copia;
    });
    notas = asignarTrastes(sin, afi);
  }
  notas.sort((a, b) => a.start - b.start || a.pitch - b.pitch);
  const pedales = base.tracks.flatMap((t) => t.pedals);
  const pista = take.tracks.find((t) => t.instrument === instrumento) ?? take.tracks[0];
  return {
    take: {
      ...take,
      tracks: [
        {
          ...(pista ?? base.tracks[0]!),
          instrument: instrumento,
          notes: notas,
          pedals: instrumento === 'piano' ? pedales : [],
        },
      ],
      tempoMap: base.tempoMap,
      timeSignature: base.timeSignature,
      duration: Math.max(base.duration, ...notas.map((n) => n.end)),
    },
    seleccion: nueva,
  };
}

/** Lo mínimo de OpenSheetMusicDisplay que se usa (sin depender de su paquete aquí). */
interface NotaGrafica {
  sourceNote: {
    halfTone: number;
    isRest(): boolean;
    Length: { RealValue: number };
    ParentVoiceEntry: { Timestamp: { RealValue: number } };
  };
  getSVGGElement?(): SVGGElement | undefined;
}
interface OsmdHoja {
  GraphicSheet: {
    MeasureList: { staffEntries: { graphicalVoiceEntries: { notes: NotaGrafica[] }[] }[] }[][];
  };
}

/** Altura que se ve en la hoja (MIDI) de cada pieza de batería, para reconocerlas al tocar. */
function teclaVistaBateria(): Map<number, number> {
  const pasos: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  return new Map(PIEZAS_BATERIA.map((p) => [(p.octava + 1) * 12 + pasos[p.paso]!, p.nota]));
}

/**
 * Hace que cada nota (y silencio) de la hoja se pueda tocar. `alElegir` recibe la selección,
 * con la tecla corregida a la de la partitura (la nota más cercana de ese momento).
 */
export function hacerSeleccionable(
  osmd: OsmdHoja,
  score: Score,
  instrumento: Instrument,
  alElegir: (s: Seleccion) => void,
): () => void {
  const quitar: (() => void)[] = [];
  const bateria = instrumento === 'drums' ? teclaVistaBateria() : null;
  osmd.GraphicSheet.MeasureList.forEach((pentagramas, compas) => {
    pentagramas.forEach((medida, indicePentagrama) => {
      // Guitarra: el pentagrama de notas y la tablatura son el mismo (0).
      const pentagrama: 0 | 1 = instrumento === 'piano' && indicePentagrama === 1 ? 1 : 0;
      for (const entrada of medida?.staffEntries ?? []) {
        for (const voz of entrada.graphicalVoiceEntries) {
          for (const gn of voz.notes) {
            const el = gn.getSVGGElement?.();
            if (!el) continue;
            const inicio = Math.round(gn.sourceNote.ParentVoiceEntry.Timestamp.RealValue * 4 * DIV);
            const duracion = Math.round(gn.sourceNote.Length.RealValue * 4 * DIV);
            const elegir = (e: Event) => {
              e.stopPropagation();
              let tecla: number | null = null;
              if (!gn.sourceNote.isRest()) {
                const vista = gn.sourceNote.halfTone + 12;
                const evento = score.measures[compas]?.staves[pentagrama].find(
                  (x) => x.start === inicio,
                );
                const alturas = evento?.pitches ?? [];
                if (bateria) tecla = bateria.get(vista) ?? alturas[0] ?? null;
                else {
                  // La más cercana (la guitarra se escribe una octava más alta de lo que suena).
                  tecla = alturas.reduce<number | null>((m, p) => {
                    const d = Math.min(
                      Math.abs(p - vista),
                      Math.abs(p - vista + 12),
                      Math.abs(p - vista - 12),
                    );
                    const dm =
                      m === null
                        ? Infinity
                        : Math.min(
                            Math.abs(m - vista),
                            Math.abs(m - vista + 12),
                            Math.abs(m - vista - 12),
                          );
                    return d < dm ? p : m;
                  }, null);
                }
              }
              alElegir({ compas, pentagrama, inicio, duracion, tecla });
            };
            el.style.cursor = 'pointer';
            el.dataset.compas = String(compas);
            el.dataset.pentagrama = String(pentagrama);
            el.dataset.inicio = String(inicio);
            el.addEventListener('click', elegir);
            quitar.push(() => el.removeEventListener('click', elegir));
          }
        }
      }
    });
  });
  return () => quitar.forEach((f) => f());
}

/** Marca en ámbar lo elegido (todas las cabezas de ese momento y pentagrama). */
export function marcarSeleccion(contenedor: HTMLElement, sel: Seleccion | null): void {
  for (const el of contenedor.querySelectorAll('.impromptu-elegida'))
    el.classList.remove('impromptu-elegida');
  if (!sel) return;
  const css = `[data-compas="${sel.compas}"][data-pentagrama="${sel.pentagrama}"][data-inicio="${sel.inicio}"]`;
  for (const el of contenedor.querySelectorAll(css)) el.classList.add('impromptu-elegida');
}

/** Estilo de lo elegido y de la barra (se inyecta una vez). */
export function estilosEditor(): void {
  if (document.getElementById('impromptu-editor-estilos')) return;
  const s = document.createElement('style');
  s.id = 'impromptu-editor-estilos';
  s.textContent = `
.impromptu-elegida path, .impromptu-elegida rect, .impromptu-elegida text { fill: #FF9F1C !important; stroke: #FF9F1C !important; }
.impromptu-barra { position: sticky; bottom: 12px; z-index: 6; display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
  width: max-content; max-width: calc(100% - 24px); margin: 0 auto; padding: 8px; border: 1px solid #3D3D39; border-radius: 6px;
  background: rgba(35,35,33,0.97); box-shadow: 0 12px 30px rgba(0,0,0,0.45); color: #E8E4DC;
  font: 500 13px/1 Archivo, system-ui, sans-serif; animation: impromptu-barra 180ms cubic-bezier(0.2,0.8,0.2,1); }
@keyframes impromptu-barra { from { opacity: 0; transform: translateY(8px); } }
.impromptu-barra button { min-width: 40px; min-height: 40px; padding: 0 10px; border: 1px solid #3D3D39; border-radius: 4px;
  background: #2E2E2B; color: #E8E4DC; font: inherit; cursor: pointer; }
.impromptu-barra button:hover { border-color: #7A4A00; }
.impromptu-barra button:focus-visible { outline: 2px solid #FF9F1C; outline-offset: 2px; }
.impromptu-barra button[aria-pressed="true"] { background: #FF9F1C; border-color: #FF9F1C; color: #1C1C1A; }
.impromptu-barra .nombre { padding: 0 8px; font: 500 12px/1 'Martian Mono', monospace; color: #FF9F1C; letter-spacing: 0.04em; }
.impromptu-barra .sep { width: 1px; align-self: stretch; background: #3D3D39; }
`;
  document.head.append(s);
}

/** Barra de edición (DOM). `aplicar` hace la edición; `cerrar` quita la selección. */
export class BarraEdicion {
  readonly el: HTMLDivElement;
  private sel: Seleccion | null = null;

  constructor(
    contenedor: HTMLElement,
    private readonly instrumento: Instrument,
    private readonly aplicar: (e: Edicion) => void,
    private readonly cerrar: () => void,
    private readonly deshacer?: () => void,
    private readonly rehacer?: () => void,
  ) {
    estilosEditor();
    this.el = document.createElement('div');
    this.el.className = 'impromptu-barra';
    this.el.setAttribute('role', 'toolbar');
    this.el.setAttribute('aria-label', 'Editar la partitura');
    this.el.hidden = true;
    contenedor.append(this.el);
    window.addEventListener('keydown', this.teclas);
  }

  quitar(): void {
    window.removeEventListener('keydown', this.teclas);
    this.el.remove();
  }

  mostrar(sel: Seleccion | null): void {
    this.sel = sel;
    this.el.hidden = !sel;
    if (!sel) return;
    this.el.replaceChildren();
    const boton = (texto: string, titulo: string, f: () => void, presionado?: boolean) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = texto;
      b.title = titulo;
      b.setAttribute('aria-label', titulo);
      if (presionado !== undefined) b.setAttribute('aria-pressed', String(presionado));
      b.addEventListener('click', f);
      this.el.append(b);
    };
    const sep = () =>
      this.el.append(Object.assign(document.createElement('span'), { className: 'sep' }));
    const nombre = document.createElement('span');
    nombre.className = 'nombre';
    nombre.textContent =
      sel.tecla === null
        ? 'Silencio'
        : this.instrumento === 'drums'
          ? (PIEZAS_BATERIA.find((p) => p.nota === sel.tecla || p.otras.includes(sel.tecla!))
              ?.nombre ?? 'Golpe')
          : nombreNota(sel.tecla);
    nombre.setAttribute('role', 'status');
    this.el.append(nombre);
    if (sel.tecla === null) {
      boton('Poner nota', 'Poner una nota en el silencio (N)', () =>
        this.aplicar({ tipo: 'poner' }),
      );
    } else {
      if (this.instrumento !== 'drums') {
        boton('▲', 'Subir medio tono (↑)', () => this.aplicar({ tipo: 'altura', semitonos: 1 }));
        boton('▼', 'Bajar medio tono (↓)', () => this.aplicar({ tipo: 'altura', semitonos: -1 }));
        boton('8va▲', 'Subir una octava (Shift ↑)', () =>
          this.aplicar({ tipo: 'altura', semitonos: 12 }),
        );
        boton('8va▼', 'Bajar una octava (Shift ↓)', () =>
          this.aplicar({ tipo: 'altura', semitonos: -12 }),
        );
      } else {
        boton('▲', 'Otra pieza de la batería (↑)', () =>
          this.aplicar({ tipo: 'altura', semitonos: 1 }),
        );
        boton('▼', 'Otra pieza de la batería (↓)', () =>
          this.aplicar({ tipo: 'altura', semitonos: -1 }),
        );
      }
      sep();
      for (const f of FIGURAS)
        boton(
          f.nombre.slice(0, 3) + '.',
          `${f.nombre} (${f.tecla})`,
          () => this.aplicar({ tipo: 'figura', divisiones: f.divisiones }),
          sel.duracion === f.divisiones,
        );
      boton('•', 'Con puntillo (.)', () =>
        this.aplicar({ tipo: 'figura', divisiones: Math.round(sel.duracion * 1.5) }),
      );
      sep();
      if (this.instrumento === 'piano')
        boton(sel.pentagrama === 0 ? 'A la izquierda' : 'A la derecha', 'Cambiar de mano (M)', () =>
          this.aplicar({ tipo: 'mano' }),
        );
      if (this.instrumento === 'guitar' || this.instrumento === 'bass') {
        boton('Cuerda▲', 'La misma nota en otra cuerda', () =>
          this.aplicar({ tipo: 'cuerda', delta: -1 }),
        );
        boton('Cuerda▼', 'La misma nota en otra cuerda', () =>
          this.aplicar({ tipo: 'cuerda', delta: 1 }),
        );
      }
      boton('Borrar', 'Borrar (Supr)', () => this.aplicar({ tipo: 'borrar' }));
    }
    sep();
    if (this.deshacer) boton('↶', 'Deshacer (Ctrl+Z)', this.deshacer);
    if (this.rehacer) boton('↷', 'Rehacer (Ctrl+Y)', this.rehacer);
    boton('✕', 'Quitar la selección (Esc)', this.cerrar);
  }

  private teclas = (e: KeyboardEvent) => {
    const sel = this.sel;
    if (!sel) return;
    const t = e.target as HTMLElement | null;
    if (t?.closest('input, textarea, select, [contenteditable="true"]')) return;
    const k = e.key;
    let hecho = true;
    if (k === 'ArrowUp' && sel.tecla !== null)
      this.aplicar({ tipo: 'altura', semitonos: e.shiftKey ? 12 : 1 });
    else if (k === 'ArrowDown' && sel.tecla !== null)
      this.aplicar({ tipo: 'altura', semitonos: e.shiftKey ? -12 : -1 });
    else if (k >= '1' && k <= '5' && sel.tecla !== null)
      this.aplicar({ tipo: 'figura', divisiones: FIGURAS[Number(k) - 1]!.divisiones });
    else if (k === '.' && sel.tecla !== null)
      this.aplicar({ tipo: 'figura', divisiones: Math.round(sel.duracion * 1.5) });
    else if ((k === 'Delete' || k === 'Backspace') && sel.tecla !== null)
      this.aplicar({ tipo: 'borrar' });
    else if (k.toLowerCase() === 'n' && sel.tecla === null) this.aplicar({ tipo: 'poner' });
    else if (k.toLowerCase() === 'm' && this.instrumento === 'piano')
      this.aplicar({ tipo: 'mano' });
    else if (k === 'Escape') this.cerrar();
    else hecho = false;
    if (hecho) e.preventDefault();
  };
}
