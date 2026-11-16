import type { PedalEvent, PedalKind, Seconds } from './model';

/** Número de controlador MIDI (CC) de cada pedal. */
export const PEDAL_CC: Readonly<Record<PedalKind, number>> = {
  sustain: 64,
  sostenuto: 66,
  soft: 67,
};

/** Devuelve el pedal que corresponde a un CC, o null si el CC no es de pedal. */
export function pedalKindFromCC(cc: number): PedalKind | null {
  switch (cc) {
    case 64:
      return 'sustain';
    case 66:
      return 'sostenuto';
    case 67:
      return 'soft';
    default:
      return null;
  }
}

/**
 * Lógica binaria del pedal: pisado si el valor es ≥ 64 (BUGS B-004).
 * El valor completo 0–127 se guarda siempre para el medio pedal.
 */
export function isPedalDown(value: number): boolean {
  return value >= 64;
}

/**
 * Valor del pedal `kind` en el instante `time` (0 si aún no hay eventos).
 * `pedals` debe venir ordenado por `time`, como exige `Track`.
 */
export function pedalValueAt(
  pedals: readonly PedalEvent[],
  kind: PedalKind,
  time: Seconds,
): number {
  let value = 0;
  for (const p of pedals) {
    if (p.time > time) break;
    if (p.kind === kind) value = p.value;
  }
  return value;
}
