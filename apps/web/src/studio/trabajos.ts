import { create } from 'zustand';

/**
 * Trabajos en segundo plano (pedido 29 de Jacobo): videos que se arman aunque se cambie de
 * pestaña o de instrumento. La burbuja de abajo a la derecha los muestra con su avance.
 */
export interface Trabajo {
  id: number;
  tipo: 'video-partitura';
  nombre: string;
  /** 0 a 1. */
  avance: number;
  estado: 'trabajando' | 'listo' | 'error';
  mensaje?: string;
  cancelar?: () => void;
}

export const useTrabajos = create<{ lista: Trabajo[] }>(() => ({ lista: [] }));

let siguiente = 1;

export function nuevoTrabajo(tipo: Trabajo['tipo'], nombre: string, cancelar: () => void): number {
  const id = siguiente++;
  useTrabajos.setState((s) => ({
    lista: [...s.lista, { id, tipo, nombre, avance: 0, estado: 'trabajando', cancelar }],
  }));
  return id;
}

export function actualizarTrabajo(id: number, cambio: Partial<Trabajo>): void {
  useTrabajos.setState((s) => ({
    lista: s.lista.map((t) => (t.id === id ? { ...t, ...cambio } : t)),
  }));
}

export function quitarTrabajo(id: number): void {
  useTrabajos.setState((s) => ({ lista: s.lista.filter((t) => t.id !== id) }));
}

/** Termina un trabajo: si salió bien, se quita solo a los pocos segundos. */
export function terminarTrabajo(id: number, cambio: Partial<Trabajo>): void {
  actualizarTrabajo(id, { ...cambio, cancelar: undefined });
  if (cambio.estado === 'listo') window.setTimeout(() => quitarTrabajo(id), 6000);
}

/** Descarga un archivo sin que haya que tocar un enlace (pedido de Jacobo). */
export function descargar(blob: Blob, nombre: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.append(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
