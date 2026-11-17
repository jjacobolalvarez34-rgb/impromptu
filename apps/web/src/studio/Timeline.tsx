import { pedalDownRanges } from '@impromptu/audio';
import type { Take } from '@impromptu/core';
import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import { transport, useStudio } from './store';
import { formatTime } from './transport';
import styles from './Timeline.module.css';

/** Arrastrar menos que esto es un clic (buscar), no una selección. */
const DRAG_PX = 4;

interface Lane {
  id: string;
  label: string;
  name: string;
}

function lanesFor(take: Take | null): Lane[] {
  const notes = take?.tracks.flatMap((t) => t.notes) ?? [];
  const hands = new Set(notes.map((n) => n.hand));
  const lanes: Lane[] =
    hands.has('R') || hands.has('L')
      ? [
          { id: 'R', label: 'MD', name: 'Mano derecha' },
          { id: 'L', label: 'MI', name: 'Mano izquierda' },
        ]
      : [{ id: 'all', label: 'Notas', name: 'Notas' }];
  lanes.push({ id: 'pedal', label: 'Ped.', name: 'Pedal' });
  return lanes;
}

/** Lee un token de color de DESIGN para dibujar en el lienzo 2D. */
const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/**
 * Línea de tiempo con carriles (DESIGN §5): toda la toma en miniatura. Clic para buscar,
 * arrastrar para marcar la sección que se repite.
 */
export function Timeline({ playheadRef }: { playheadRef: RefObject<HTMLDivElement | null> }) {
  const take = useStudio((s) => s.take);
  const colors = useStudio((s) => s.settings.colors);
  const loop = useStudio((s) => s.loop);
  const loopOn = useStudio((s) => s.loopOn);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const drag = useRef<{ x0: number; t0: number; moved: boolean } | null>(null);
  const lanes = lanesFor(take);
  const duration = take?.duration ?? 0;

  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.floor(entry!.contentRect.width)),
    );
    observer.observe(area);
    return () => observer.disconnect();
  }, []);

  // Dibujo de los carriles (solo cuando cambia la toma, el tamaño o los colores).
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0) return;
    const lanes = lanesFor(take);
    const laneH = 22;
    const gap = 4;
    const height = lanes.length * laneH + (lanes.length - 1) * gap;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const x = (t: number) => (duration > 0 ? (t / duration) * width : 0);

    const notes = take?.tracks.flatMap((t) => t.notes) ?? [];
    const pitches = notes.map((n) => n.pitch);
    const low = Math.min(...pitches, 127);
    const high = Math.max(...pitches, 0);
    const span = Math.max(1, high - low);

    lanes.forEach((lane, i) => {
      const y0 = i * (laneH + gap);
      ctx.fillStyle = token('--panel-alto');
      ctx.fillRect(0, y0, width, laneH);
      if (!take) return;
      if (lane.id === 'pedal') {
        ctx.fillStyle = token('--ambar');
        const pedals = take.tracks.flatMap((t) => t.pedals).sort((a, b) => a.time - b.time);
        for (const [a, b] of pedalDownRanges(pedals, 'sustain')) {
          const end = Math.min(b, duration);
          ctx.fillRect(x(a), y0 + laneH / 2 - 2, Math.max(1, x(end) - x(a)), 4);
        }
        return;
      }
      for (const n of notes) {
        if (lane.id !== 'all' && n.hand !== lane.id) continue;
        const color =
          n.hand === 'R' ? colors.right : n.hand === 'L' ? colors.left : colors.unassigned;
        ctx.fillStyle = color;
        const y = y0 + 2 + (1 - (n.pitch - low) / span) * (laneH - 5);
        ctx.fillRect(x(n.start), y, Math.max(1, x(n.end) - x(n.start)), 1.5);
      }
    });
  }, [take, width, colors, duration]);

  const timeAt = (clientX: number) => {
    const rect = areaRef.current!.getBoundingClientRect();
    return Math.min(duration, Math.max(0, ((clientX - rect.left) / rect.width) * duration));
  };

  const onDown = (e: ReactPointerEvent) => {
    if (!take) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x0: e.clientX, t0: timeAt(e.clientX), moved: false };
  };
  const onMove = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (Math.abs(e.clientX - d.x0) > DRAG_PX) d.moved = true;
    if (d.moved) {
      const t = timeAt(e.clientX);
      useStudio.getState().setLoop({ start: Math.min(d.t0, t), end: Math.max(d.t0, t) });
    }
  };
  const onUp = (e: ReactPointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) transport.seek(timeAt(e.clientX));
  };

  const pct = (t: number) => (duration > 0 ? `${(t / duration) * 100}%` : '0%');

  return (
    <div className={styles.linea}>
      <ul className={styles.etiquetas} aria-hidden="true">
        {lanes.map((l) => (
          <li key={l.id}>{l.label}</li>
        ))}
      </ul>
      <div
        ref={areaRef}
        className={styles.area}
        role="slider"
        tabIndex={take ? 0 : -1}
        aria-label="Línea de tiempo. Clic para ir a un momento; arrastra para marcar la sección que se repite."
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={0}
        aria-valuetext={
          loop ? `Sección de ${formatTime(loop.start)} a ${formatTime(loop.end)}` : undefined
        }
        aria-disabled={!take}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onKeyDown={(e) => {
          if (!take) return;
          const step = e.shiftKey ? 10 : 2;
          if (e.key === 'ArrowRight') transport.seek(transport.now() + step);
          else if (e.key === 'ArrowLeft') transport.seek(transport.now() - step);
          else return;
          e.preventDefault();
        }}
      >
        <canvas ref={canvasRef} className={styles.lienzo} />
        {loop && (
          <div
            className={styles.seccion}
            data-activa={loopOn}
            style={{ left: pct(loop.start), width: pct(loop.end - loop.start) }}
          />
        )}
        <div ref={playheadRef} className={styles.cabezal} />
      </div>
    </div>
  );
}
