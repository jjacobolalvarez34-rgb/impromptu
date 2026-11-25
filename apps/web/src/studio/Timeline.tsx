import { editarPedal, tramosDePedal } from '@impromptu/core';
import type { Take, TramoPedal } from '@impromptu/core';
import { Button } from '@impromptu/ui';
import { Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';
import { audioOffset, useOwnAudio } from './ownAudio';
import { transport, useStudio } from './store';
import { formatTime } from './transport';
import styles from './Timeline.module.css';

/** Arrastrar menos que esto es un clic (buscar), no una selección. */
const DRAG_PX = 4;
const LANE_H = 22;
const LANE_GAP = 4;
/** Qué tan cerca (px) del borde de un pedal hay que agarrar para alargarlo o acortarlo. */
const BORDE_PX = 6;

/** Pedido 58: qué se hace al arrastrar en el carril del pedal. */
type ModoPedal = 'crear' | 'desde' | 'hasta' | 'mover';

interface Lane {
  id: string;
  label: string;
  name: string;
}

function lanesFor(take: Take | null, hasAudio: boolean): Lane[] {
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
  if (hasAudio) lanes.push({ id: 'audio', label: 'Audio', name: 'Audio' });
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
  const drag = useRef<{
    x0: number;
    t0: number;
    moved: boolean;
    pedal?: { modo: ModoPedal; indice: number | null; original: TramoPedal | null };
  } | null>(null);
  // Pedido 58: editar el pedal en su carril (arrastrar para crear, tocar para elegir, bordes).
  const tramos = useMemo(
    () =>
      take
        ? tramosDePedal(
            take.tracks.flatMap((t) => t.pedals),
            'sustain',
          )
        : [],
    [take],
  );
  const [selT, setSelT] = useState<number | null>(null);
  const [borrador, setBorrador] = useState<{ indice: number | null; tramo: TramoPedal } | null>(
    null,
  );
  const seleccionado =
    selT === null ? -1 : tramos.findIndex((p) => p.desde <= selT && selT < p.hasta);
  const own = useOwnAudio((s) => s.audio);
  const lanes = lanesFor(take, own !== null);
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
    const lanes = lanesFor(take, own !== null);
    const laneH = LANE_H;
    const gap = LANE_GAP;
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
      if (lane.id === 'audio') {
        if (!own) return;
        ctx.fillStyle = token('--gris-texto');
        const start = audioOffset(own);
        const cols = own.peaks.length;
        const step = own.buffer.duration / cols;
        for (let c = 0; c < cols; c++) {
          const t0 = start + c * step;
          if (t0 < 0 || t0 > duration) continue;
          const h = Math.max(1, own.peaks[c]! * (laneH - 4));
          ctx.fillRect(x(t0), y0 + (laneH - h) / 2, Math.max(1, x(t0 + step) - x(t0)), h);
        }
        return;
      }
      if (lane.id === 'pedal') {
        const lista: (TramoPedal & { sel: boolean })[] = tramos.map((p, k) => ({
          ...p,
          sel: k === seleccionado,
        }));
        if (borrador) {
          if (borrador.indice === null) lista.push({ ...borrador.tramo, sel: true });
          else lista[borrador.indice] = { ...borrador.tramo, sel: true };
        }
        for (const p of lista) {
          const desde = Math.max(0, Math.min(p.desde, p.hasta));
          const hasta = Math.min(Math.max(p.desde, p.hasta), duration);
          const w = Math.max(1, x(hasta) - x(desde));
          ctx.fillStyle = p.sel ? token('--chasis') : token('--ambar');
          ctx.fillRect(x(desde), y0 + laneH / 2 - (p.sel ? 4 : 2), w, p.sel ? 8 : 4);
          if (p.sel) {
            // Agarraderas en los bordes.
            ctx.fillRect(x(desde) - 1, y0 + 3, 2, laneH - 6);
            ctx.fillRect(x(hasta) - 1, y0 + 3, 2, laneH - 6);
          }
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
  }, [take, width, colors, duration, own, tramos, seleccionado, borrador]);

  const timeAt = (clientX: number) => {
    const rect = areaRef.current!.getBoundingClientRect();
    return Math.min(duration, Math.max(0, ((clientX - rect.left) / rect.width) * duration));
  };

  const carrilEn = (clientY: number) => {
    const rect = areaRef.current!.getBoundingClientRect();
    return lanes[Math.floor((clientY - rect.top) / (LANE_H + LANE_GAP))]?.id;
  };

  /** Qué pedal y qué parte se agarró en el tiempo t (null: lugar vacío, se crea uno). */
  const agarrar = (t: number) => {
    const tol = width > 0 ? (BORDE_PX / width) * duration : 0;
    for (let i = 0; i < tramos.length; i++) {
      const p = tramos[i]!;
      if (Math.abs(t - p.desde) <= tol) return { modo: 'desde' as const, indice: i, original: p };
      if (Number.isFinite(p.hasta) && Math.abs(t - p.hasta) <= tol)
        return { modo: 'hasta' as const, indice: i, original: p };
      if (p.desde <= t && t < p.hasta) return { modo: 'mover' as const, indice: i, original: p };
    }
    return { modo: 'crear' as const, indice: null, original: null };
  };

  const guardarPedal = (cambiar: (t: TramoPedal[]) => TramoPedal[]) =>
    useStudio.getState().edit((tk) => editarPedal(tk, 'sustain', cambiar));

  const borrarSeleccionado = () => {
    if (seleccionado < 0) return;
    const i = seleccionado;
    guardarPedal((t) => t.filter((_, k) => k !== i));
    setSelT(null);
  };

  const onDown = (e: ReactPointerEvent) => {
    if (!take) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const t0 = timeAt(e.clientX);
    drag.current = {
      x0: e.clientX,
      t0,
      moved: false,
      ...(carrilEn(e.clientY) === 'pedal' ? { pedal: agarrar(t0) } : {}),
    };
  };
  const onMove = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (Math.abs(e.clientX - d.x0) > DRAG_PX) d.moved = true;
    if (!d.moved) return;
    const t = timeAt(e.clientX);
    if (d.pedal) {
      const { modo, indice, original } = d.pedal;
      const o = original ?? { desde: d.t0, hasta: d.t0 };
      const tramo =
        modo === 'crear'
          ? { desde: Math.min(d.t0, t), hasta: Math.max(d.t0, t) }
          : modo === 'desde'
            ? { desde: t, hasta: o.hasta }
            : modo === 'hasta'
              ? { desde: o.desde, hasta: t }
              : { desde: o.desde + (t - d.t0), hasta: o.hasta + (t - d.t0) };
      setBorrador({ indice, tramo });
      return;
    }
    useStudio.getState().setLoop({ start: Math.min(d.t0, t), end: Math.max(d.t0, t) });
  };
  const onUp = (e: ReactPointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (d?.pedal) {
      const b = borrador;
      setBorrador(null);
      if (d.moved && b) {
        const tramo = {
          desde: Math.min(b.tramo.desde, b.tramo.hasta),
          hasta: Math.max(b.tramo.desde, b.tramo.hasta),
        };
        guardarPedal((t) =>
          b.indice === null ? [...t, tramo] : t.map((x, k) => (k === b.indice ? tramo : x)),
        );
        setSelT(Math.max(0, tramo.desde) + 1e-3);
        return;
      }
      // Tocar un pedal lo elige; tocar el carril vacío quita la elección y busca.
      if (d.pedal.indice !== null) setSelT(d.t0);
      else setSelT(null);
    }
    if (d && !d.moved) {
      const t = timeAt(e.clientX);
      // Un clic fuera de la sección marcada la quita (pedido de Jacobo); dentro, solo busca.
      const loopNow = useStudio.getState().loop;
      if (loopNow && (t < loopNow.start || t > loopNow.end)) useStudio.getState().setLoop(null);
      transport.seek(t);
    }
  };

  const pct = (t: number) => (duration > 0 ? `${(t / duration) * 100}%` : '0%');

  return (
    <div className={`${styles.linea} ui-aparece-texto`}>
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
        aria-label="Línea de tiempo. Clic para ir a un momento; arrastra para marcar la sección que se repite; clic fuera de ella o Esc para quitarla. En el carril del pedal: arrastra para crear un pedal, toca uno para elegirlo, arrastra sus bordes para cambiarlo y Suprimir para borrarlo."
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
          else if ((e.key === 'Delete' || e.key === 'Backspace') && seleccionado >= 0)
            borrarSeleccionado();
          else if (e.key === 'Escape' && seleccionado >= 0) setSelT(null);
          else if (e.key === 'Escape' && useStudio.getState().loop)
            useStudio.getState().setLoop(null);
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
      {seleccionado >= 0 && (
        <div className={styles.pedalElegido} role="group" aria-label="Pedal elegido">
          <span>
            Pedal de {formatTime(tramos[seleccionado]!.desde)} a{' '}
            {Number.isFinite(tramos[seleccionado]!.hasta)
              ? formatTime(tramos[seleccionado]!.hasta)
              : 'el final'}
            . Arrastra sus bordes para cambiarlo.
          </span>
          <Button icon={<Trash2 />} onClick={borrarSeleccionado}>
            Borrar pedal
          </Button>
        </div>
      )}
    </div>
  );
}
