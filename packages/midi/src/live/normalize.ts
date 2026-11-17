import type { PedalKind } from '@impromptu/core';
import { pedalKindFromCC } from '@impromptu/core';
import type { DeviceProfile } from './profiles';

/** Evento de teclado en vivo, ya limpio. `time` en segundos del reloj de performance.now(). */
export type LiveEvent =
  | { type: 'noteon'; pitch: number; velocity: number; channel: number; time: number }
  | { type: 'noteoff'; pitch: number; channel: number; time: number }
  | { type: 'pedal'; kind: PedalKind; value: number; channel: number; time: number };

/**
 * Convierte un mensaje MIDI crudo en un evento útil, o null si no interesa.
 * Aplica docs/BUGS.md:
 * - B-001: note-on con velocity 0 = note-off.
 * - B-003: se ignoran mensajes de sistema (active sensing 0xFE, clock 0xF8, sysex).
 * - B-004: el pedal guarda su valor completo 0–127 (medio pedal).
 * - B-005: el perfil puede invertir la polaridad del pedal.
 * - B-007: el tiempo sale de `timeStamp` del evento (ms), no de la hora de llegada.
 */
export function normalizeMessage(
  data: ArrayLike<number>,
  timeStamp: number,
  profile?: DeviceProfile,
): LiveEvent | null {
  const status = data[0];
  if (status === undefined || status < 0x80 || status >= 0xf0) return null;
  const type = status & 0xf0;
  const channel = status & 0x0f;
  const a = data[1] ?? 0;
  const b = data[2] ?? 0;
  const time = timeStamp / 1000;

  switch (type) {
    case 0x90:
      if (b === 0) return { type: 'noteoff', pitch: a, channel, time };
      return { type: 'noteon', pitch: a, velocity: applyCurve(b, profile), channel, time };
    case 0x80:
      return { type: 'noteoff', pitch: a, channel, time };
    case 0xb0: {
      const kind = pedalKindFromCC(a);
      if (!kind) return null;
      const value = profile?.invertPedal ? 127 - b : b;
      return { type: 'pedal', kind, value, channel, time };
    }
    default:
      return null;
  }
}

/** Curva de velocity del perfil: >1 hace más fácil tocar fuerte, <1 más difícil. */
function applyCurve(velocity: number, profile?: DeviceProfile): number {
  const gamma = profile?.velocityCurve ?? 1;
  if (gamma === 1) return velocity;
  return Math.min(127, Math.max(1, Math.round(127 * Math.pow(velocity / 127, 1 / gamma))));
}
