import type { Instrument } from '@impromptu/core';

/**
 * Sonidos grabados de guitarra, bajo y batería (pedido 25 de Jacobo): bancos libres de FreePats
 * y MuldjordKit armados con `scripts/muestras.mjs` (ver docs/LICENCIAS.md). Cada banco tiene un
 * `manifiesto.json`; aquí se decide qué grabación suena para cada nota y fuerza. Mismas reglas
 * en la app de Android (`Muestras.kt`).
 */

/** Bancos disponibles: un timbre de guitarra, el bajo o la batería. */
export type Banco = 'nylon' | 'acero' | 'electrica' | 'bajo' | 'bateria';

export interface ZonaCuerda {
  /** Nota grabada (MIDI). */
  nota: number;
  /** Fuerza máxima de esta capa (la siguiente capa empieza en hastaFuerza + 1). */
  hastaFuerza: number;
  archivo: string;
}

export interface CapaBateria {
  hastaFuerza: number;
  /** Variaciones del mismo golpe: se turnan para que los golpes seguidos no suenen a máquina. */
  archivos: string[];
}

export interface Manifiesto {
  nombre: Banco;
  autor: string;
  licencia: string;
  /** Ganancia para que el banco suene parejo con los demás. */
  ganancia: number;
  zonas?: ZonaCuerda[];
  piezas?: Record<string, CapaBateria[]>;
}

/** El banco que suena para un instrumento (la guitarra, según el timbre elegido). */
export function bancoDe(instrument: Instrument, timbreGuitarra: Banco): Banco | null {
  if (instrument === 'drums') return 'bateria';
  if (instrument === 'bass') return 'bajo';
  if (instrument === 'guitar') return timbreGuitarra === 'bajo' ? 'acero' : timbreGuitarra;
  return null;
}

/**
 * Grabación de una cuerda: la nota grabada más cercana (a igual distancia, la de abajo, que
 * suena más natural al subirla) y, de ella, la capa que corresponde a la fuerza. `rate` es la
 * velocidad de reproducción que la lleva a la altura pedida.
 */
export function zonaCuerda(
  zonas: readonly ZonaCuerda[],
  pitch: number,
  velocity: number,
): { zona: ZonaCuerda; rate: number } | null {
  if (zonas.length === 0) return null;
  let cercana = zonas[0]!.nota;
  for (const z of zonas) {
    const d = Math.abs(z.nota - pitch);
    const mejor = Math.abs(cercana - pitch);
    if (d < mejor || (d === mejor && z.nota < cercana)) cercana = z.nota;
  }
  const capas = zonas
    .filter((z) => z.nota === cercana)
    .sort((a, b) => a.hastaFuerza - b.hastaFuerza);
  const zona = capas.find((z) => velocity <= z.hastaFuerza) ?? capas[capas.length - 1]!;
  return { zona, rate: Math.pow(2, (pitch - zona.nota) / 12) };
}

/** Grabación de un golpe de batería: la capa según la fuerza y la variación según el turno. */
export function golpeBateria(
  piezas: Readonly<Record<string, readonly CapaBateria[]>>,
  nota: number,
  velocity: number,
  turno: number,
): string | null {
  const capas = piezas[String(nota)];
  if (!capas || capas.length === 0) return null;
  const capa = capas.find((c) => velocity <= c.hastaFuerza) ?? capas[capas.length - 1]!;
  return capa.archivos[turno % capa.archivos.length] ?? null;
}

/** Todos los archivos de un banco (para descargarlos). */
export function archivosDe(m: Manifiesto): string[] {
  const zonas = (m.zonas ?? []).map((z) => z.archivo);
  const golpes = Object.values(m.piezas ?? {}).flatMap((capas) => capas.flatMap((c) => c.archivos));
  return [...new Set([...zonas, ...golpes])];
}
