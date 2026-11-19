import type { Beat, NoteEvent } from '@impromptu/core';

/**
 * Cómo se rasguea (fase 11, pedido de Jacobo): cada acorde de guitarra de 3 cuerdas o más
 * que suenan casi juntas es un rasgueo, hacia abajo (de la 6.ª a la 1.ª cuerda) o hacia arriba.
 */
export interface Rasgueo {
  /** Segundo del primer golpe del acorde. */
  time: number;
  dir: 'abajo' | 'arriba';
  /** Ids de las notas del acorde (para dibujar la flecha junto a ellas). */
  ids: string[];
}

/** Notas seguidas a menos de esto (y en total menos de MAXIMO) forman un mismo rasgueo. */
const ENTRE = 0.05;
const MAXIMO = 0.25;
/** Menos separación que esto entre la primera y la última: el acorde es "a la vez". */
const A_LA_VEZ = 0.008;

/**
 * Detecta los rasgueos. Si las cuerdas suenan escalonadas, la dirección sale del orden (la 6.ª
 * primero es hacia abajo). Si suenan a la vez (MIDI cuantizado), del lugar en el pulso: en el
 * pulso, abajo; entre pulsos, arriba (el patrón más común).
 */
export function rasgueos(notas: readonly NoteEvent[], beats: readonly Beat[] = []): Rasgueo[] {
  const conCuerda = notas
    .filter((n) => n.string !== undefined)
    .slice()
    .sort((a, b) => a.start - b.start);
  const salida: Rasgueo[] = [];
  let b = 0;
  for (let i = 0; i < conCuerda.length;) {
    const inicio = conCuerda[i]!.start;
    let j = i;
    while (
      j < conCuerda.length &&
      (j === i || conCuerda[j]!.start - conCuerda[j - 1]!.start <= ENTRE) &&
      conCuerda[j]!.start - inicio <= MAXIMO
    )
      j++;
    const grupo = conCuerda.slice(i, j);
    i = j;
    const cuerdas = new Set(grupo.map((n) => n.string));
    if (cuerdas.size < 3) continue;
    const ultima = grupo[grupo.length - 1]!.start;
    let dir: Rasgueo['dir'];
    if (ultima - inicio > A_LA_VEZ) {
      // Correlación entre cuerda y tiempo: las graves (número alto) primero → abajo.
      const mt = grupo.reduce((s, n) => s + n.start, 0) / grupo.length;
      const mc = grupo.reduce((s, n) => s + n.string!, 0) / grupo.length;
      const cov = grupo.reduce((s, n) => s + (n.start - mt) * (n.string! - mc), 0);
      dir = cov <= 0 ? 'abajo' : 'arriba';
    } else {
      while (b + 1 < beats.length && beats[b + 1]!.time <= inicio + 1e-6) b++;
      const actual = beats[b];
      const siguiente = beats[b + 1];
      if (!actual || !siguiente || actual.time > inicio) dir = 'abajo';
      else {
        const fraccion = (inicio - actual.time) / (siguiente.time - actual.time);
        dir = fraccion > 0.3 && fraccion < 0.7 ? 'arriba' : 'abajo';
      }
    }
    salida.push({ time: inicio, dir, ids: grupo.map((n) => n.id) });
  }
  return salida;
}
