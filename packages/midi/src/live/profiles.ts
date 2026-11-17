import type { KeyboardRange } from '@impromptu/core';

/**
 * Perfil de un teclado: corrige sus rarezas (ARQUITECTURA, "Compatibilidad entre marcas").
 * Casi todo teclado funciona con el perfil genérico; los usuarios pueden aportar más por PR.
 */
export interface DeviceProfile {
  id: string;
  label: string;
  /** Teclas físicas del instrumento. */
  range?: KeyboardRange;
  /** Pedal con polaridad invertida (BUGS B-005). */
  invertPedal?: boolean;
  /** Exponente de la curva de velocity (1 = sin cambio). */
  velocityCurve?: number;
  /** Solo un canal; si falta, se escuchan todos. */
  channel?: number;
  match: (name: string, manufacturer: string) => boolean;
}

export const PROFILES: readonly DeviceProfile[] = [
  {
    id: 'yamaha-psr-e343',
    label: 'Yamaha PSR-E343',
    range: { low: 36, high: 96 },
    // El PSR-E343 detecta la polaridad del FC4/FC5 al encenderse: no hace falta invertir.
    invertPedal: false,
    // En Windows suele aparecer como "Digital Keyboard" de Yamaha.
    match: (name, maker) =>
      /psr-?e343/i.test(name) || (/yamaha/i.test(maker) && /digital keyboard/i.test(name)),
  },
];

export const GENERIC_PROFILE: DeviceProfile = {
  id: 'generic',
  label: 'Teclado MIDI',
  match: () => true,
};

export function profileFor(name: string, manufacturer = ''): DeviceProfile {
  return PROFILES.find((p) => p.match(name, manufacturer)) ?? GENERIC_PROFILE;
}
