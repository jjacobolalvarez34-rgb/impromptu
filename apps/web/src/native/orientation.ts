/**
 * Orientación de la pantalla en el celular (DESIGN §5): el inicio en vertical; la pieza, la
 * partitura y la grabación en horizontal. El navegador solo deja fijarla en pantalla completa:
 * si no puede, la vista pide girar el celular.
 */
export async function lockOrientation(kind: 'portrait' | 'landscape'): Promise<void> {
  try {
    const orientation = screen.orientation as ScreenOrientation & {
      lock?: (o: string) => Promise<void>;
    };
    await orientation.lock?.(kind);
  } catch {
    // Fuera de pantalla completa no se puede: la vista pide girar el celular.
  }
}
