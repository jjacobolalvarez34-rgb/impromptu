import type { NoteEvent } from '@impromptu/core';

/**
 * Con qué se toca cada golpe de batería (pedido 40 de Jacobo: "la baqueta con la que deben
 * tocar"): D (mano derecha), I (mano izquierda) o P (pie). Reglas de baterista, para alguien
 * diestro con el hi-hat a la izquierda:
 * - bombo y hi-hat con el pie: P;
 * - hi-hat, ride y crash: D (la mano que lleva el ritmo);
 * - si la caja o un tom suena junto con un platillo, va con la I;
 * - caja y toms seguidos y rápidos se alternan D-I-D-I (golpes sencillos).
 */
export type Baqueta = 'D' | 'I' | 'P';

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
      if (PIES.has(n.pitch)) salida.set(n.id, 'P');
      else if (PLATILLOS.has(n.pitch)) salida.set(n.id, 'D');
    }
    if (tambores.length === 0) {
      if (hayPlatillo) ultimaMano = { t: t0, mano: 'D' };
      continue;
    }
    if (hayPlatillo) {
      // La mano derecha está en el platillo: los tambores con la izquierda.
      for (const n of tambores) salida.set(n.id, 'I');
      ultimaMano = { t: t0, mano: 'I' };
      continue;
    }
    // Dos tambores a la vez: uno con cada mano (el más agudo con la derecha).
    if (tambores.length > 1) {
      const porAltura = [...tambores].sort((a, b) => b.pitch - a.pitch);
      porAltura.forEach((n, k) => salida.set(n.id, k % 2 === 0 ? 'D' : 'I'));
      ultimaMano = { t: t0, mano: 'D' };
      continue;
    }
    // Un tambor solo: alterna si viene rápido detrás del anterior; si no, empieza con la D.
    const mano: Baqueta =
      ultimaMano && t0 - ultimaMano.t < RAPIDO ? (ultimaMano.mano === 'D' ? 'I' : 'D') : 'D';
    salida.set(tambores[0]!.id, mano);
    ultimaMano = { t: t0, mano };
  }
  return salida;
}
