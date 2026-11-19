import { DEFAULT_SETTINGS, Visualizer } from '@impromptu/render';
import { useEffect, useRef } from 'react';
import { createDemoBateria, createDemoGuitarra, createDemoPiece } from './demo';
import styles from './HeroVisualizer.module.css';

/**
 * Visualizador real de Impromptu de fondo en la portada: se turnan piano, guitarra y batería
 * (pedido 23 de Jacobo: más fondos), cada uno una vuelta de su pieza.
 * Optimizado: densidad de píxeles limitada y se pausa si no se ve o si la pestaña está oculta.
 */
export function HeroVisualizer() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let viz: Visualizer | null = null;
    let raf = 0;
    let visible = true;
    let alive = true;
    const piezas = [createDemoPiece(), createDemoGuitarra(), createDemoBateria()];
    let actual = 0;
    let take = piezas[0]!;
    let start = performance.now();

    const loop = () => {
      raf = 0;
      if (!viz || !visible || document.hidden) return;
      let t = (performance.now() - start) / 1000;
      // Al terminar una vuelta, pasa al siguiente instrumento.
      if (t >= take.duration) {
        actual = (actual + 1) % piezas.length;
        take = piezas[actual]!;
        viz.setTake(take);
        start = performance.now();
        t = 0;
      }
      viz.render(t + 0.0001);
      raf = requestAnimationFrame(loop);
    };
    const resume = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      resume();
    });
    observer.observe(host);
    document.addEventListener('visibilitychange', resume);

    const resize = new ResizeObserver(() => {
      const r = host.getBoundingClientRect();
      viz?.resize(Math.max(1, Math.floor(r.width)), Math.max(1, Math.floor(r.height)));
    });

    const r = host.getBoundingClientRect();
    Visualizer.create({
      width: Math.max(1, Math.floor(r.width)),
      height: Math.max(1, Math.floor(r.height)),
      resolution: Math.min(1.5, window.devicePixelRatio || 1),
    })
      .then((v) => {
        if (!alive) return v.destroy();
        viz = v;
        v.canvas.className = styles.canvas ?? '';
        v.canvas.setAttribute('aria-hidden', 'true');
        host.appendChild(v.canvas);
        v.setTake(take);
        v.setSettings({
          ...DEFAULT_SETTINGS,
          effects: {
            ...DEFAULT_SETTINGS.effects,
            sparks: 120,
            keyGlow: 110,
            noteGlow: 90,
            fallSpeed: 0.9,
          },
          show: { ...DEFAULT_SETTINGS.show, pedals: [] },
        });
        resize.observe(host);
        resume();
      })
      .catch(() => undefined); // sin WebGL: queda el fondo carbón

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      resize.disconnect();
      document.removeEventListener('visibilitychange', resume);
      viz?.canvas.remove();
      viz?.destroy();
    };
  }, []);

  return <div ref={hostRef} className={styles.host} />;
}
