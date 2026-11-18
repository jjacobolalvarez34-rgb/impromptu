/**
 * Batería (fase 9): las piezas del kit con su número del mapa General MIDI (canal 10), que es
 * lo que mandan las baterías electrónicas por USB. Mismo cuadro en la app de Android
 * (`Bateria.kt`). El orden es el de los carriles del visualizador, de izquierda a derecha.
 */
export interface PiezaBateria {
  id: string;
  nombre: string;
  /** Nota General MIDI que se usa al escribirla. */
  nota: number;
  /** Otras notas General MIDI que cuentan como esta pieza. */
  otras: readonly number[];
  /** Lugar en el pentagrama de percusión (MusicXML: display-step y display-octave). */
  paso: string;
  octava: number;
  /** Cabeza en cruz (platillos y hi-hat). */
  cruz: boolean;
}

export const PIEZAS_BATERIA: readonly PiezaBateria[] = [
  {
    id: 'hihat-pie',
    nombre: 'Hi-hat (pie)',
    nota: 44,
    otras: [],
    paso: 'D',
    octava: 4,
    cruz: true,
  },
  { id: 'bombo', nombre: 'Bombo', nota: 36, otras: [35], paso: 'F', octava: 4, cruz: false },
  {
    id: 'tom-piso',
    nombre: 'Tom de piso',
    nota: 43,
    otras: [41],
    paso: 'A',
    octava: 4,
    cruz: false,
  },
  { id: 'caja', nombre: 'Caja', nota: 38, otras: [37, 39, 40], paso: 'C', octava: 5, cruz: false },
  {
    id: 'tom-medio',
    nombre: 'Tom medio',
    nota: 47,
    otras: [45],
    paso: 'D',
    octava: 5,
    cruz: false,
  },
  {
    id: 'tom-agudo',
    nombre: 'Tom agudo',
    nota: 50,
    otras: [48],
    paso: 'E',
    octava: 5,
    cruz: false,
  },
  { id: 'hihat', nombre: 'Hi-hat', nota: 42, otras: [46], paso: 'G', octava: 5, cruz: true },
  { id: 'ride', nombre: 'Ride', nota: 51, otras: [53, 59], paso: 'F', octava: 5, cruz: true },
  { id: 'crash', nombre: 'Crash', nota: 49, otras: [52, 55, 57], paso: 'A', octava: 5, cruz: true },
];

const POR_NOTA = new Map<number, PiezaBateria>();
for (const p of PIEZAS_BATERIA) for (const n of [p.nota, ...p.otras]) POR_NOTA.set(n, p);

/** Pieza del kit para una nota General MIDI (null si no es de batería). */
export function piezaDeNota(nota: number): PiezaBateria | null {
  return POR_NOTA.get(nota) ?? null;
}

export function piezaPorId(id: string): PiezaBateria | null {
  return PIEZAS_BATERIA.find((p) => p.id === id) ?? null;
}

/** Hi-hat abierto (46): se dibuja igual que el hi-hat pero suena distinto. */
export const HIHAT_ABIERTO = 46;
