import { Visualizer } from '@impromptu/render';
import type { Background } from '@impromptu/render';
import { useEffect, useRef, useState } from 'react';
import { live, liveNow } from './live';
import { transport, useStudio } from './store';
import type { Aspect } from './store';
import styles from './VisualizerView.module.css';

const RATIO: Record<Aspect, number> = { '16:9': 16 / 9, '9:16': 9 / 16, '1:1': 1 };

interface Props {
  /** Se llama en cada cuadro con el tiempo actual (para el LCD y la barra de tiempo). */
  onFrame?: (t: number) => void;
  showFps?: boolean;
  /** Ocupar todo el espacio, sin la proporción del formato (ruta /en-vivo). */
  fill?: boolean;
  /** Proporción fija (ancho/alto) que reemplaza al formato elegido; 4/5 en el celular. */
  ratio?: number;
  background?: Background;
}

/** Lienzo del visualizador. Dibuja con el reloj del transporte, fuera del ciclo de React. */
export function VisualizerView({
  onFrame,
  showFps = false,
  fill = false,
  ratio: fixedRatio,
  background = 'theme',
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const fpsRef = useRef<HTMLSpanElement>(null);
  const [viz, setViz] = useState<Visualizer | null>(null);
  const [failed, setFailed] = useState(false);
  const take = useStudio((s) => s.take);
  const settings = useStudio((s) => s.settings);
  const aspect = useStudio((s) => s.aspect);
  const onFrameRef = useRef(onFrame);
  useEffect(() => {
    onFrameRef.current = onFrame;
  });

  // Cada visualizador crea su propio lienzo. Compartir uno entre dos montajes (React lo
  // monta dos veces en desarrollo) hacía que el primero, al destruirse, perdiera el
  // contexto WebGL del segundo y el lienzo quedaba en blanco.
  useEffect(() => {
    let alive = true;
    let created: Visualizer | null = null;
    const host = hostRef.current;
    if (!host) return;
    Visualizer.create({ width: 640, height: 360 })
      .then((v) => {
        if (!alive) return v.destroy();
        created = v;
        v.canvas.className = styles.canvas ?? '';
        v.canvas.setAttribute('aria-label', 'Visualizador de notas');
        v.canvas.setAttribute('role', 'img');
        host.appendChild(v.canvas);
        setViz(v);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
      created?.canvas.remove();
      created?.destroy();
      setViz(null);
    };
  }, []);

  useEffect(() => viz?.setTake(take), [viz, take]);
  useEffect(() => viz?.setSettings(settings), [viz, settings]);
  useEffect(() => viz?.setBackground(background), [viz, background]);

  // Encajar el lienzo en el espacio disponible con la proporción elegida.
  useEffect(() => {
    const stage = stageRef.current;
    if (!viz || !stage) return;
    const fit = () => {
      const { width, height } = stage.getBoundingClientRect();
      const ratio = fill ? width / Math.max(1, height) : (fixedRatio ?? RATIO[aspect]);
      let w = width;
      let h = width / ratio;
      if (h > height) {
        h = height;
        w = height * ratio;
      }
      viz.resize(Math.max(1, Math.floor(w)), Math.max(1, Math.floor(h)));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [viz, aspect, fill, fixedRatio]);

  // Bucle de dibujo.
  useEffect(() => {
    if (!viz) return;
    let raf = 0;
    let frames = 0;
    let since = performance.now();
    // Vista en vivo: lo que se toca sube desde las teclas (aunque no haya notas, el
    // teclado queda limpio y listo). Vista de toma: sus notas caen.
    let showingLive = false;
    const loop = () => {
      const now = liveNow();
      if (useStudio.getState().view === 'live' && !transport.playing) {
        viz.setLive(live.notes, live.pedals, live.range());
        showingLive = true;
        viz.render(now);
      } else {
        if (showingLive) {
          viz.setTake(useStudio.getState().take);
          showingLive = false;
        }
        viz.render(transport.now());
      }
      onFrameRef.current?.(transport.now());
      frames++;
      const wall = performance.now();
      if (wall - since >= 500) {
        if (fpsRef.current)
          fpsRef.current.textContent = `${Math.round((frames * 1000) / (wall - since))} fps`;
        frames = 0;
        since = wall;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [viz]);

  return (
    <div ref={stageRef} className={styles.stage} data-fill={fill}>
      <div ref={hostRef} className={styles.host} />
      {failed && (
        <p className={styles.error}>
          Tu navegador no pudo iniciar el visualizador (WebGL). Prueba con Chrome o Edge
          actualizados.
        </p>
      )}
      {showFps && <span ref={fpsRef} className={styles.fps} aria-hidden="true" />}
    </div>
  );
}
