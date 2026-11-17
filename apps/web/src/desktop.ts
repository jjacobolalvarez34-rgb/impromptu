/**
 * Puente con la app de escritorio (apps/desktop, ADR-018). En el navegador no hace nada.
 * Cada opción del menú nativo llega como un evento `impromptu:menu` que el Estudio atiende.
 */
interface DesktopBridge {
  platform: string;
  onMenu(listener: (action: string) => void): () => void;
}

declare global {
  interface Window {
    impromptuDesktop?: DesktopBridge;
  }
}

export type MenuAction =
  | 'abrir-midi'
  | 'convertir-audio'
  | 'guardar-midi'
  | 'exportar-video'
  | 'deshacer'
  | 'rehacer'
  | 'ver-estudio'
  | 'ver-partitura';

/** ¿Corre dentro de la app de escritorio? */
export const isDesktop = () => typeof window !== 'undefined' && !!window.impromptuDesktop;

const EVENT = 'impromptu:menu';

/** Conecta el menú nativo (una vez, al arrancar la app). */
export function connectDesktopMenu(): void {
  window.impromptuDesktop?.onMenu((action) =>
    window.dispatchEvent(new CustomEvent<MenuAction>(EVENT, { detail: action as MenuAction })),
  );
}

/** Escucha las opciones del menú; devuelve la función para dejar de escuchar. */
export function onMenuAction(listener: (action: MenuAction) => void): () => void {
  const handler = (e: Event) => listener((e as CustomEvent<MenuAction>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

/** Pide abrir el selector de "Convertir un audio" (lo atiende ConvertAudioButton). */
export const requestConvertAudio = () =>
  window.dispatchEvent(new CustomEvent<MenuAction>(EVENT, { detail: 'convertir-audio' }));
