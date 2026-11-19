import type { NoteEvent } from '@impromptu/core';

/**
 * Con qué se toca cada golpe de batería (pedido 40 de Jacobo: "la baqueta con la que deben
 * tocar"): R (mano derecha), L (izquierda), RF (pie derecho, el bombo) o LF (pie izquierdo,
 * el hi-hat). Reglas de baterista, para alguien
 * diestro con el hi-hat a la izquierda:
 * - bombo con el pie derecho (RF) y hi-hat de pie con el izquierdo (LF);
 * - hi-hat, ride y crash: R (la mano que lleva el ritmo);
 * - si la caja o un tom suena junto con un platillo, va con la L;
 * - caja y toms seguidos y rápidos se alternan R-L-R-L (golpes sencillos).
 */
export type Baqueta = 'R' | 'L' | 'RF' | 'LF';

const PIES = new Set([35, 36, 44]);
const PLATILLOS = new Set([42, 46, 49, 51, 52, 53, 55, 57, 59]);
/** Golpes a menos de esto suenan "juntos". */
const JUNTOS = 0.03;
/** Golpes de caja o toms más seguidos que esto se alternan. */
const RAPIDO = 0.22;

export function baquetas(notas: readonly NoteEvent[]): Map<string, Baqueta> {
  const salida = new Map<string, Baqueta>();
  const ordenadas = [...notas].sort((a, b) => a.start - b.start);
  let ultimaMano: { t: number; mano: Baqueta } | null = null;
  for (let i = 0; i < ordenadas.length;) {
    const t0 = ordenadas[i]!.start;
    let j = i;
    while (j < ordenadas.length && ordenadas[j]!.start - t0 < JUNTOS) j++;
    const grupo = ordenadas.slice(i, j);
    i = j;
    const hayPlatillo = grupo.some((n) => PLATILLOS.has(n.pitch));
    const tambores = grupo.filter((n) => !PIES.has(n.pitch) && !PLATILLOS.has(n.pitch));
    for (const n of grupo) {
      if (PIES.has(n.pitch)) salida.set(n.id, n.pitch === 44 ? 'LF' : 'RF');
      else if (PLATILLOS.has(n.pitch)) salida.set(n.id, 'R');
    }
    if (tambores.length === 0) {
      if (hayPlatillo) ultimaMano = { t: t0, mano: 'R' };
      continue;
    }
    if (hayPlatillo) {
      // La mano derecha está en el platillo: los tambores con la izquierda.
      for (const n of tambores) salida.set(n.id, 'L');
      ultimaMano = { t: t0, mano: 'L' };
      continue;
    }
    // Dos tambores a la vez: uno con cada mano (el más agudo con la derecha).
    if (tambores.length > 1) {
      const porAltura = [...tambores].sort((a, b) => b.pitch - a.pitch);
      porAltura.forEach((n, k) => salida.set(n.id, k % 2 === 0 ? 'R' : 'L'));
      ultimaMano = { t: t0, mano: 'R' };
      continue;
    }
    // Un tambor solo: alterna si viene rápido detrás del anterior; si no, empieza con la D.
    const mano: Baqueta =
      ultimaMano && t0 - ultimaMano.t < RAPIDO ? (ultimaMano.mano === 'R' ? 'L' : 'R') : 'R';
    salida.set(tambores[0]!.id, mano);
    ultimaMano = { t: t0, mano };
  }
  return salida;
}
