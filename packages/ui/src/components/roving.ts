import type { KeyboardEvent } from 'react';

/**
 * Navegación con flechas, Inicio y Fin para grupos de una sola selección
 * (chips y pestañas). Devuelve el índice nuevo o null si la tecla no aplica.
 */
export function rovingIndex(e: KeyboardEvent, current: number, count: number): number | null {
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return (current + 1) % count;
    case 'ArrowLeft':
    case 'ArrowUp':
      return (current - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}

export function focusItem(container: HTMLElement | null, selector: string, index: number) {
  const items = container?.querySelectorAll<HTMLElement>(selector);
  items?.[index]?.focus();
}
