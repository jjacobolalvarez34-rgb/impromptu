import type { PedalEvent, PedalKind, Take } from './model';
import { isPedalDown } from './pedal';

/** Un tramo en que el pedal está pisado (segundos). `hasta` puede ser Infinity (nunca se suelta). */
export interface TramoPedal {
  desde: number;
  hasta: number;
}

/** Tramos pisados de un pedal, en orden. */
export function tramosDePedal(pedals: readonly PedalEvent[], kind: PedalKind): TramoPedal[] {
  const tramos: TramoPedal[] = [];
  let abajo: number | null = null;
  const ordenados = [...pedals].filter((p) => p.kind === kind).sort((a, b) => a.time - b.time);
  for (const p of ordenados) {
    const pisado = isPedalDown(p.value);
    if (pisado && abajo === null) abajo = p.time;
    else if (!pisado && abajo !== null) {
      tramos.push({ desde: abajo, hasta: p.time });
      abajo = null;
    }
  }
  if (abajo !== null) tramos.push({ desde: abajo, hasta: Infinity });
  return tramos;
}

/** Ordena, quita los vacíos y une los tramos que se tocan o se pisan. */
export function limpiarTramos(tramos: readonly TramoPedal[]): TramoPedal[] {
  const orden = tramos
    .map((t) => ({
      desde: Math.max(0, Math.min(t.desde, t.hasta)),
      hasta: Math.max(t.desde, t.hasta),
    }))
    .filter((t) => t.hasta - t.desde > 1e-3)
    .sort((a, b) => a.desde - b.desde);
  const unidos: TramoPedal[] = [];
  for (const t of orden) {
    const ultimo = unidos[unidos.length - 1];
    if (ultimo && t.desde <= ultimo.hasta) ultimo.hasta = Math.max(ultimo.hasta, t.hasta);
    else unidos.push({ ...t });
  }
  return unidos;
}

/**
 * Cambia los eventos de un pedal por los de estos tramos (pisar a 127, soltar a 0). Los demás
 * pedales quedan igual. Nota: un medio pedal grabado dentro de un tramo editado se vuelve
 * pedal completo; solo cambia lo que se edita.
 */
export function conTramos(
  pedals: readonly PedalEvent[],
  kind: PedalKind,
  tramos: readonly TramoPedal[],
): PedalEvent[] {
  const otros = pedals.filter((p) => p.kind !== kind);
  const nuevos: PedalEvent[] = [];
  for (const t of limpiarTramos(tramos)) {
    nuevos.push({ kind, time: t.desde, value: 127 });
    if (Number.isFinite(t.hasta)) nuevos.push({ kind, time: t.hasta, value: 0 });
  }
  return [...otros, ...nuevos].sort((a, b) => a.time - b.time);
}

/**
 * Edita los tramos de un pedal de toda la toma (pedido 58 de Jacobo). Los eventos de ese pedal
 * quedan en la primera pista que tenía pedales (o en la primera pista).
 */
export function editarPedal(
  take: Take,
  kind: PedalKind,
  cambiar: (tramos: TramoPedal[]) => TramoPedal[],
): Take {
  const todos = take.tracks.flatMap((t) => t.pedals);
  const tramos = cambiar(tramosDePedal(todos, kind));
  const destino = Math.max(
    0,
    take.tracks.findIndex((t) => t.pedals.some((p) => p.kind === kind)),
  );
  return {
    ...take,
    tracks: take.tracks.map((t, i) => {
      const sinEste = t.pedals.filter((p) => p.kind !== kind);
      return { ...t, pedals: i === destino ? conTramos(sinEste, kind, tramos) : sinEste };
    }),
  };
}
