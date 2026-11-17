import { useEffect } from 'react';

/**
 * Animaciones al hacer scroll: todo elemento con `data-revelar` recibe `data-visible`
 * la primera vez que entra en pantalla (una sola vez; nada se recalcula al seguir bajando).
 */
export function useReveal(root: React.RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute('data-visible', 'true');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
    );
    el.querySelectorAll('[data-revelar]').forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [root]);
}
