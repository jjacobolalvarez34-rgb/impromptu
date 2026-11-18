import { Visualizer } from '@impromptu/render';
import type { Aspect } from '@impromptu/export';
import { useEffect, useRef } from 'react';
import { useStudio } from './store';
import styles from './ExportDialog.module.css';

/** Ancho de la miniatura (px) y cuánto dura el tramo que se repite (s). */
const ANCHO = 360;
const CICLO = 8;

const PROPORCION: Record<Aspect, number> = { '16:9': 16 / 9, '9:16': 9 / 16, '1:1': 1 };

/**
 * Vista previa del video (pedido de Jacobo, 2026-11-18): el comienzo de la pieza cayendo, en
 * miniatura y con la forma del formato elegido, con los mismos ajustes que se exportan.
 */
export function ExportPreview({ aspect }: { aspect: Aspect }) {
  const caja = useRef<HTMLDivElement>(null);
  const take = useStudio((s) => s.take);
  const settings = useStudio((s) => s.settings);

  useEffect(() => {
    const el = caja.current;
    if (!el || !take) return;
    let viz: Visualizer | null = null;
    let raf = 0;
    let vivo = true;
    const p = PROPORCION[aspect];
    // Las verticales no crecen más que las horizontales: se limita el alto.
    const alto = Math.round(Math.min(ANCHO / p, 200));
    const ancho = Math.round(alto * p);
    const notas = take.tracks.flatMap((t) => t.notes);
    const primera = notas.reduce((m, n) => Math.min(m, n.start), Number.POSITIVE_INFINITY);
    // Dos segundos antes de la primera nota, para verla caer.
    const desde = Number.isFinite(primera) ? primera - 2 : 0;
    const inicio = performance.now();
    void Visualizer.create({
      width: ancho,
      height: alto,
      resolution: window.devicePixelRatio || 1,
    }).then((v) => {
      if (!vivo) {
        v.destroy();
        return;
      }
      viz = v;
      v.setTake(take);
      v.setSettings(settings);
      v.canvas.style.width = `${ancho}px`;
      v.canvas.style.height = `${alto}px`;
      el.replaceChildren(v.canvas);
      const ciclo = Math.min(CICLO, Math.max(4, take.duration - desde));
      const cuadro = () => {
        v.render(desde + (((performance.now() - inicio) / 1000) % ciclo));
        raf = requestAnimationFrame(cuadro);
      };
      raf = requestAnimationFrame(cuadro);
    });
    return () => {
      vivo = false;
      cancelAnimationFrame(raf);
      viz?.destroy();
      el.replaceChildren();
    };
  }, [take, settings, aspect]);

  if (!take) return null;
  return (
    <figure className={styles.previa}>
      <div ref={caja} className={styles.lienzo} aria-label="Vista previa del video" role="img" />
      <figcaption className="ui-etiqueta">Vista previa</figcaption>
    </figure>
  );
}
