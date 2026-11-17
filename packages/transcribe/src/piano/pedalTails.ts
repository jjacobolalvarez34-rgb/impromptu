import type { PianoNote, PianoPedal } from './postprocess';

/** Una nota "termina por el pedal" si su final cae a esta distancia (s) de soltar el pedal. */
const NEAR_RELEASE = 0.3;
/** Duración mínima que se deja a una nota recortada (s). */
const MIN_LENGTH = 0.12;
/** Zona del teclado donde se busca la nota siguiente (semitonos a cada lado). */
const REGISTER = 12;

/**
 * Desde el audio, con el pedal de sustain pisado, el modelo ve la nota sonar hasta que se suelta
 * el pedal: no sabe cuándo se soltó la tecla. Eso da notas larguísimas que no son las que se
 * tocaron. Aquí se estima el soltar de la tecla para esas notas: lo primero entre la siguiente
 * nota de su zona del teclado y la siguiente vez que se pisa el pedal (al cambiar de armonía
 * casi siempre ya se soltó la tecla).
 *
 * Es provisional: en la fase 6 las duraciones salen del ritmo de la partitura (pedido de Jacobo).
 * No toca las notas que terminan lejos de soltar el pedal (esas sí se mantuvieron con la mano).
 */
export function trimPedalTails(
  notes: readonly PianoNote[],
  pedals: readonly PianoPedal[],
): PianoNote[] {
  const byStart = [...notes].sort((a, b) => a.start - b.start);
  return byStart.map((n) => {
    const heldByPedal = pedals.some(
      (p) => p.start < n.end && Math.abs(n.end - p.end) <= NEAR_RELEASE && p.end > n.start,
    );
    if (!heldByPedal) return n;
    const next = byStart.find(
      (m) => m !== n && m.start >= n.start + MIN_LENGTH && Math.abs(m.pitch - n.pitch) <= REGISTER,
    );
    const repress = pedals.find((p) => p.start > n.start + MIN_LENGTH / 2);
    const end = Math.min(n.end, next?.start ?? Infinity, repress?.start ?? Infinity);
    return { ...n, end: Math.max(end, n.start + MIN_LENGTH) };
  });
}
