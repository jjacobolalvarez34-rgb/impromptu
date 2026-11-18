/**
 * Cursor suave para la partitura (pedido de Jacobo, 2026-11-18). El cursor de
 * OpenSheetMusicDisplay salta de nota en nota; los reproductores que se ven fluidos
 * (Soundslice, Flat, MuseScore) dibujan su propia línea y la deslizan a 60 fps entre la nota
 * actual y la siguiente. Aquí se lee una vez dónde cae cada nota en la hoja y después solo
 * se interpola: nada de recorrer el cursor de OSMD mientras suena.
 */

/** Un punto del recorrido: tiempo en redondas y su lugar en la hoja (px, dentro del contenedor). */
export interface PuntoCursor {
  t: number;
  x: number;
  y: number;
  alto: number;
  /** Renglón (sistema) de la hoja: cambia cuando el cursor baja a la línea siguiente. */
  renglon: number;
}

/** Fin de cada renglón (px): hasta dónde se desliza la línea antes de bajar. */
export type FinesDeRenglon = Map<number, number>;

/**
 * Lugar de la línea en el tiempo `t` (redondas): interpola entre el punto actual y el
 * siguiente. Si el siguiente está en otro renglón, avanza hasta el fin del renglón actual.
 */
export function posicionEn(
  puntos: readonly PuntoCursor[],
  fines: FinesDeRenglon,
  t: number,
): { x: number; y: number; alto: number; renglon: number } | null {
  if (puntos.length === 0) return null;
  let lo = 0;
  let hi = puntos.length - 1;
  if (t <= puntos[0]!.t) return { ...puntos[0]! };
  while (lo < hi) {
    const m = (lo + hi + 1) >> 1;
    if (puntos[m]!.t <= t) lo = m;
    else hi = m - 1;
  }
  const a = puntos[lo]!;
  const b = puntos[lo + 1];
  if (!b || b.t <= a.t) return { ...a };
  const f = (t - a.t) / (b.t - a.t);
  const destino = b.renglon === a.renglon ? b.x : (fines.get(a.renglon) ?? a.x);
  return { x: a.x + (destino - a.x) * f, y: a.y, alto: a.alto, renglon: a.renglon };
}

/** Lo mínimo de OpenSheetMusicDisplay que se usa (sin depender de su paquete aquí). */
interface CursorOsmd {
  cursorElement: HTMLElement;
  Iterator: { EndReached: boolean; currentTimeStamp: { RealValue: number } };
  show(): void;
  hide(): void;
  reset(): void;
  next(): void;
}

/** Recorre el cursor de OSMD una vez (al dibujar la hoja) y anota dónde cae cada nota. */
export function leerRecorrido(cursor: CursorOsmd): {
  puntos: PuntoCursor[];
  fines: FinesDeRenglon;
} {
  const puntos: PuntoCursor[] = [];
  const fines: FinesDeRenglon = new Map();
  cursor.show();
  cursor.reset();
  let renglon = 0;
  let ultimoY = Number.NaN;
  let pasos = 0;
  while (!cursor.Iterator.EndReached && pasos++ < 100_000) {
    const el = cursor.cursorElement;
    const x = parseFloat(el.style.left) || 0;
    const y = parseFloat(el.style.top) || 0;
    const alto = parseFloat(el.style.height) || el.offsetHeight || 0;
    const ancho = el.offsetWidth || 10;
    if (!Number.isNaN(ultimoY) && Math.abs(y - ultimoY) > 4) renglon++;
    ultimoY = y;
    puntos.push({ t: cursor.Iterator.currentTimeStamp.RealValue, x, y, alto, renglon });
    fines.set(renglon, Math.max(fines.get(renglon) ?? 0, x + ancho * 2));
    cursor.next();
  }
  cursor.reset();
  cursor.hide();
  return { puntos, fines };
}

/** Tiempo en segundos → redondas, con los compases de la partitura (lineal dentro del compás). */
export function aRedondas(
  t: number,
  measureTimes: readonly number[],
  bpm: number,
  time: readonly [number, number],
): number {
  const negras = time[0] * (4 / time[1]);
  let m = 0;
  while (m + 1 < measureTimes.length && measureTimes[m + 1]! <= t) m++;
  const inicio = measureTimes[m] ?? 0;
  const fin = measureTimes[m + 1] ?? inicio + (60 / bpm) * negras;
  const frac = Math.min(0.999, Math.max(0, (t - inicio) / Math.max(1e-6, fin - inicio)));
  return ((m + frac) * negras) / 4;
}

/**
 * Línea ámbar que se desliza sobre la hoja y la desplaza con suavidad. `contenedor` es el
 * elemento donde OSMD dibujó (posición relativa) y `desplazable`, el que tiene la barra de
 * desplazamiento (puede ser el mismo).
 */
export class LineaDeLectura {
  private readonly linea: HTMLDivElement;
  private renglonActual = -1;
  private objetivoScroll: number | null = null;

  constructor(
    private readonly contenedor: HTMLElement,
    private readonly desplazable: HTMLElement,
    private readonly recorrido: { puntos: PuntoCursor[]; fines: FinesDeRenglon },
  ) {
    if (getComputedStyle(contenedor).position === 'static') contenedor.style.position = 'relative';
    this.linea = document.createElement('div');
    this.linea.setAttribute('aria-hidden', 'true');
    Object.assign(this.linea.style, {
      position: 'absolute',
      left: '0',
      top: '0',
      width: '3px',
      borderRadius: '2px',
      background: '#FF9F1C',
      boxShadow: '0 0 10px 2px rgba(255,159,28,0.45)',
      pointerEvents: 'none',
      willChange: 'transform',
      zIndex: '5',
    } satisfies Partial<CSSStyleDeclaration>);
    contenedor.append(this.linea);
  }

  /** Mueve la línea al tiempo `t` (redondas). Llamar en cada cuadro (requestAnimationFrame). */
  mover(t: number): void {
    const p = posicionEn(this.recorrido.puntos, this.recorrido.fines, t);
    if (!p) return;
    this.linea.style.height = `${p.alto}px`;
    this.linea.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
    if (p.renglon !== this.renglonActual) {
      this.renglonActual = p.renglon;
      // El renglón que suena queda a un tercio de la vista.
      const vista = this.desplazable.clientHeight;
      const d = this.desplazable.getBoundingClientRect();
      const c = this.contenedor.getBoundingClientRect();
      const arriba = c.top - d.top + this.desplazable.scrollTop;
      this.objetivoScroll = Math.max(0, arriba + p.y - vista / 3);
    }
    if (this.objetivoScroll !== null) {
      const d = this.objetivoScroll - this.desplazable.scrollTop;
      if (Math.abs(d) < 1) this.objetivoScroll = null;
      else this.desplazable.scrollTop += d * 0.12;
    }
  }

  quitar(): void {
    this.linea.remove();
  }
}
