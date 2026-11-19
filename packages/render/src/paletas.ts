/**
 * Colores listos para elegir (lista de Jacobo, 2026-11-19): un toque y las dos manos cambian
 * juntas. "Hielo" sale de su imagen de referencia (nota azul con borde blanco).
 */
export interface Paleta {
  id: string;
  nombre: string;
  right: string;
  left: string;
}

export const PALETAS: readonly Paleta[] = [
  { id: 'ambar', nombre: 'Ámbar', right: '#FF9F1C', left: '#E8E4DC' },
  { id: 'hielo', nombre: 'Hielo', right: '#6E9BEA', left: '#BFD8FF' },
  { id: 'neon', nombre: 'Neón', right: '#B15CFF', left: '#2EE6FF' },
  { id: 'fuego', nombre: 'Fuego', right: '#FF5A36', left: '#FFC247' },
  { id: 'menta', nombre: 'Menta', right: '#2FD98F', left: '#B9F5DA' },
  { id: 'rosa', nombre: 'Rosa', right: '#FF5FA2', left: '#FFD0E6' },
];

/** La paleta que coincide con los colores actuales, si hay una. */
export function paletaDe(colors: { right: string; left: string }): Paleta | undefined {
  const r = colors.right.toUpperCase();
  const l = colors.left.toUpperCase();
  return PALETAS.find((p) => p.right === r && p.left === l);
}
