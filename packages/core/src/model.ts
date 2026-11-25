/**
 * Modelo de datos de Impromptu. Es el contrato entre visualizador, editor,
 * exportación, partitura y tutoriales: copia EXACTA de docs/ARQUITECTURA.md.
 * Cambiarlo requiere un ADR en docs/DECISIONES.md (ver ADR-003).
 */

export type Seconds = number;
export type Hand = 'L' | 'R';
export type Finger = 1 | 2 | 3 | 4 | 5;
export type Instrument = 'piano' | 'guitar' | 'bass' | 'drums';

export interface NoteEvent {
  id: string;
  pitch: number; // MIDI 0–127
  start: Seconds;
  end: Seconds;
  velocity: number; // 1–127
  hand: Hand | null; // null = sin asignar
  handSource: 'auto' | 'user' | null;
  finger: Finger | null;
  fingerSource: 'auto' | 'user' | null;
  voice?: number; // para partitura
  string?: number; // guitarra (fase 9)
  fret?: number; // guitarra (fase 9)
  drumPiece?: string; // batería (fase 9)
  channel?: number; // canal MIDI 0–15, para colorear por canal (pedido 65)
  origin: 'midi-live' | 'midi-file' | 'audio' | 'edit';
}

export type PedalKind = 'sustain' | 'sostenuto' | 'soft'; // CC64, CC66, CC67
export interface PedalEvent {
  kind: PedalKind;
  time: Seconds;
  value: number /* 0–127 */;
}

export interface Track {
  id: string;
  instrument: Instrument;
  name: string;
  notes: NoteEvent[]; // ordenadas por start
  pedals: PedalEvent[]; // ordenados por time
}

export interface TempoPoint {
  time: Seconds;
  bpm: number;
}
export interface MediaRef {
  kind: 'video' | 'audio';
  storageKey: string; // OPFS
  offset: Seconds; // dónde empieza respecto a la toma
  calibration?: KeyboardCalibration; // solo video de cámara
}
export interface KeyboardCalibration {
  lowKey: { pitch: number; x: number; y: number }; // coordenadas normalizadas 0–1
  highKey: { pitch: number; x: number; y: number };
  keyLineY: number; // altura de la línea donde "aterrizan" las notas
}

export interface Take {
  id: string;
  title: string;
  createdAt: string;
  duration: Seconds;
  tracks: Track[];
  tempoMap: TempoPoint[]; // vacío = sin tempo detectado
  timeSignature?: [number, number];
  keySignature?: string;
  media: MediaRef[];
  keyboardRange: { low: number; high: number }; // ej. 36–96 para 61 teclas
  device?: { name: string; manufacturer?: string };
}

export interface VisualProject {
  takeId: string;
  themeId: string;
  layout: 'visualizer' | 'camera-top' | 'camera-inset' | 'background';
  aspect: '16:9' | '9:16' | '1:1';
  effects: {
    sparks: number; // 0–200 %
    keyGlow: number; // 0–200 %
    fallSpeed: number;
    octaveGuides: boolean;
    noteGlow: number; // 0–200 %, halo de las notas (ADR-010)
    noteStyle:
      | 'flat'
      | 'glow'
      | 'cristal'
      | 'satin'
      // Pedido 64 (aprobados por Jacobo el 2026-11-25): notas con volumen.
      | 'vidrio'
      | 'bloque'
      | 'gema'
      | 'oro'
      | 'diamante'
      | 'luz'
      | 'claro'
      | 'chispa'; // ADR-010; cristal: pedido de Jacobo (2026-11-19)
    beatGuides: boolean; // líneas de compás y pulso (ADR-011)
  };
  show: {
    fingers: boolean;
    noteNames: boolean;
    pedals: PedalKind[];
    bigPedal?: boolean; // pedal grande, para tutoriales (ADR-017)
    pulse?: boolean; // fase 11 (pedido 18): el pulso del tempo en una esquina
    pulseSound?: boolean; // y que suene (un clic por pulso al reproducir)
    drumView?: 'carriles' | 'kit'; // fase 11 (pedido 17): carriles o una batería real
    strums?: boolean; // fase 11: flechas de rasgueo en la guitarra (encendidas si falta)
    sticking?: boolean; // pedido 40: con qué se toca cada golpe de batería (D, I, P)
    perspectiva?: boolean; // pedido 63: guitarra y bajo con la zona de notas en perspectiva (encendida si falta)
  };
  colors: { right: string; left: string; unassigned: string };
  /**
   * Estilo del visualizador (pedidos 41 y 42 de Jacobo: acabado de calidad y un editor por
   * partes). Todo es opcional: lo que falta toma el valor por defecto.
   */
  estilo?: {
    /** Un solo color para todas las notas (en vez de uno por mano). */
    colorUnico?: string | null;
    /** Redondeo de las notas, 0 (rectas) a 100 (muy redondas). */
    redondeo?: number;
    /** Brillo dentro de la nota, 0 a 100 (el halo de afuera es effects.noteGlow). */
    brilloInterno?: number;
    /** Qué sale al tocar: chispas, humo, las dos o nada. */
    particulas?: 'chispas' | 'humo' | 'ambas' | 'ninguna';
    /** Teclado realista (con sombras y teclas que bajan) o plano. */
    teclado?: 'realista' | 'plano';
    /** Cuánto se sube el teclado, en fracción del alto (0 a 0,4): deja lugar para las manos. */
    elevacion?: number;
    /** De dónde sale el color (pedido 65). Sin valor: por mano. */
    colorModo?: 'mano' | 'division' | 'pista' | 'canal' | 'nota12' | 'degradado' | 'azar';
    /** Tecla MIDI que separa las manos en el modo "división" (de ella para arriba, derecha). */
    teclaDivision?: number;
  };
  background?: { kind: 'color' | 'image' | 'video' | 'blur'; value: string };
}
