import { contextBridge, ipcRenderer } from 'electron';

/**
 * Puente mínimo con la página: la app de escritorio avisa qué opción del menú se eligió.
 * La página (apps/web) lo detecta con `window.impromptuDesktop`.
 */
contextBridge.exposeInMainWorld('impromptuDesktop', {
  platform: process.platform,
  onMenu(listener: (action: string) => void): () => void {
    const handler = (_e: unknown, action: string) => listener(action);
    ipcRenderer.on('impromptu:menu', handler);
    return () => ipcRenderer.removeListener('impromptu:menu', handler);
  },
});
