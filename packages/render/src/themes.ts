/** Colores en hex numérico para PixiJS. Los del tema Ámbar son los tokens de DESIGN §2. */
export interface Theme {
  id: string;
  name: string;
  background: number;
  whiteKey: number;
  whiteKeyEdge: number;
  blackKey: number;
  /** Franja sobre la línea de aterrizaje (fieltro en "Sala"). */
  keyLine: number;
  guide: number;
  pedal: number;
  pedalTrack: number;
  label: number;
  /** Colores por defecto por mano; el usuario los puede cambiar (son personalización). */
  notes: { right: string; left: string; unassigned: string };
}

export const THEMES: Readonly<Record<string, Theme>> = {
  ambar: {
    id: 'ambar',
    name: 'Ámbar',
    background: 0x111110,
    whiteKey: 0xe8e4dc, // --chasis
    whiteKeyEdge: 0x9a968c, // --gris-tecla
    blackKey: 0x1c1c1a, // --carbon
    keyLine: 0xff9f1c, // --ambar
    guide: 0x3d3d39, // --linea
    pedal: 0xff9f1c,
    pedalTrack: 0x2e2e2b, // --panel-alto
    label: 0xa39f95, // --gris-texto
    notes: { right: '#FF9F1C', left: '#E8E4DC', unassigned: '#9A968C' },
  },
  // Estética de la dirección A ("Ébano y fieltro"), conservada como tema de video (ADR-006).
  sala: {
    id: 'sala',
    name: 'Sala',
    background: 0x0d0b09,
    whiteKey: 0xf1e9d8,
    whiteKeyEdge: 0xa89c84,
    blackKey: 0x16120f,
    keyLine: 0x7a1f1a,
    guide: 0x2a221c,
    pedal: 0xd4af6a,
    pedalTrack: 0x221c17,
    label: 0xa89c84,
    notes: { right: '#D4AF6A', left: '#A8392F', unassigned: '#B8A88A' },
  },
};

export const DEFAULT_THEME = 'ambar';

export function getTheme(id: string): Theme {
  return THEMES[id] ?? THEMES[DEFAULT_THEME]!;
}

/** '#RRGGBB' → número para PixiJS. Si no es válido, devuelve gris. */
export function hexToNumber(hex: string): number {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  return m ? parseInt(m[1]!, 16) : 0x9a968c;
}
