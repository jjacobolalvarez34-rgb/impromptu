import { create } from 'zustand';

/**
 * Trabajos en segundo plano (pedido 29 de Jacobo): videos que se arman aunque se cambie de
 * pestaña o de instrumento. La burbuja de abajo a la derecha los muestra con su avance.
 */
export interface Trabajo {
  id: number;
  tipo: 'video-partitura' | 'video';
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

/**
 * Descargas en curso (pedido 45): el piano, los sonidos de cada instrumento… La burbuja y la
 * pantalla de carga las muestran con su avance.
 */
export interface Descarga {
  id: string;
  nombre: string;
  /** 0 a 1. */
  avance: number;
}

/** `inicioListo`: ya terminó la primera tanda (la pantalla de carga no vuelve a salir). */
export const useDescargas = create<{ lista: Descarga[]; inicioListo: boolean }>(() => ({
  lista: [],
  inicioListo: false,
}));

export function avisarDescarga(id: string, nombre: string, avance: number): void {
  useDescargas.setState((s) => {
    const otras = s.lista.filter((d) => d.id !== id);
    return { lista: [...otras, { id, nombre, avance: Math.min(1, Math.max(0, avance)) }] };
  });
}

export function terminarDescarga(id: string): void {
  useDescargas.setState((s) => {
    const lista = s.lista.filter((d) => d.id !== id);
    return { lista, inicioListo: s.inicioListo || lista.length === 0 };
  });
}

/** "Seguir sin esperar" en la pantalla de carga. */
export function saltarCarga(): void {
  useDescargas.setState({ inicioListo: true });
}
