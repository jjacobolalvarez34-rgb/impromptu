import { Capacitor } from '@capacitor/core';
import { installNativeMidi } from './midi';

/**
 * Preparativos de la app de Android (Capacitor, ADR-018). Se importa primero en main.tsx: el
 * relleno de Web MIDI tiene que existir antes de que la app pregunte si hay MIDI.
 * En el navegador y en la app de escritorio no hace nada.
 */
export const isNativeApp = Capacitor.isNativePlatform();

if (isNativeApp) {
  installNativeMidi();
  // La app abre en el inicio (con la animación del logo), no en la página de presentación.
  if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    window.history.replaceState(null, '', '/estudio?intro');
  }
}
