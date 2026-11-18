/**
 * Avance que se mueve todo el tiempo (pedido de Jacobo, 2026-11-18). La IA avisa a saltos
 * (por segmento); entre aviso y aviso la barra sigue al ritmo medido hasta ahí, sin pasarse
 * del siguiente punto real, y con ese ritmo se calcula cuánto falta. Mismo cálculo en la app
 * de Android (`AvanceSuave.kt`).
 */
export class AvanceSuave {
  private real = 0;
  private tReal: number;
  private readonly inicio: number;
  /** Fracción por milisegundo, medida con los avisos reales. */
  private ritmo = 0;

  constructor(
    ahora: number,
    /** Cuánto puede adelantarse la barra al último aviso real (un segmento, por ejemplo). */
    private paso = 0.15,
  ) {
    this.inicio = ahora;
    this.tReal = ahora;
  }

  /** Aviso real de la IA (0 a 1). `paso`: tamaño del próximo tramo, si se conoce. */
  actualizar(v: number, ahora: number, paso?: number): void {
    if (paso !== undefined) this.paso = paso;
    if (v > this.real && v > 0) this.ritmo = v / Math.max(1, ahora - this.inicio);
    if (v >= this.real) {
      this.real = v;
      this.tReal = ahora;
    }
  }

  /** Lo que muestra la barra ahora. */
  valor(ahora: number): number {
    const dt = Math.max(0, ahora - this.tReal);
    const tope = Math.min(0.99, this.real + this.paso * 0.95);
    if (this.ritmo <= 0) {
      // Sin ritmo todavía: un avance lento que se frena solo, para que se note que trabaja.
      return Math.min(tope, this.real + this.paso * 0.9 * (1 - Math.exp(-dt / 20_000)));
    }
    return Math.min(tope, this.real + this.ritmo * dt);
  }

  /** Segundos que faltan, o null si todavía no se sabe. */
  restante(ahora: number): number | null {
    if (this.ritmo <= 0) return null;
    return Math.max(0, (1 - this.valor(ahora)) / this.ritmo / 1000);
  }
}

export type EtapaDeEspera = 'leyendo' | 'descargando' | 'preparando' | 'escuchando' | 'armando';

const FRASES: Record<EtapaDeEspera, readonly string[]> = {
  leyendo: ['Leyendo el audio…', 'Pasándolo a la frecuencia de la IA…'],
  descargando: ['Descargando el modelo (solo la primera vez)…'],
  preparando: ['Preparando la IA…', 'Cargando el modelo en la memoria…'],
  escuchando: [
    'Escuchando nota por nota…',
    'Buscando dónde empieza y termina cada nota…',
    'Midiendo la fuerza de cada nota…',
    'Detectando el pedal…',
    'Separando los acordes…',
  ],
  armando: ['Armando la pieza…'],
};

/** Frase que se muestra debajo de la barra: cambia cada pocos segundos. */
export function fraseDeEspera(etapa: EtapaDeEspera, msDesdeInicio: number): string {
  const lista = FRASES[etapa];
  return lista[Math.floor(msDesdeInicio / 4500) % lista.length]!;
}

/** "Faltan unos 40 s", "Faltan unos 3 min", "Falta poco". */
export function textoRestante(segundos: number | null): string | null {
  if (segundos === null) return null;
  if (segundos < 8) return 'Falta poco';
  if (segundos < 90) return `Faltan unos ${Math.round(segundos / 5) * 5} s`;
  return `Faltan unos ${Math.round(segundos / 60)} min`;
}
