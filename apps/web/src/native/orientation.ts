import { ScreenOrientation } from '@capacitor/screen-orientation';
import { isNativeApp } from './install';

/**
 * Orientación de la pantalla en el celular (DESIGN §5): el inicio en vertical; la pieza, la
 * partitura y la grabación en horizontal (el piano nunca en vertical). En la app de Android se
 * fija; en el navegador se intenta (solo funciona en pantalla completa) y si no, se pide girar.
 */
export async function lockOrientation(kind: 'portrait' | 'landscape'): Promise<void> {
  try {
    if (isNativeApp) {
      await ScreenOrientation.lock({ orientation: kind });
      return;
    }
    const screenOrientation = screen.orientation as ScreenOrientation & {
      lock?: (o: string) => Promise<void>;
    };
    await screenOrientation.lock?.(kind);
  } catch {
    // El navegador no deja fijarla fuera de pantalla completa: la vista pide girar el celular.
  }
}
