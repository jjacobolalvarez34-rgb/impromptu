export type Aspect = '16:9' | '9:16' | '1:1';
export type Resolution = '1080p' | '4k';
export type FrameRate = 30 | 60;

/** Tamaño del video. El lado corto es 1080 (o 2160 en 4K); siempre par, como exige H.264. */
export function frameSize(
  aspect: Aspect,
  resolution: Resolution,
): { width: number; height: number } {
  const short = resolution === '4k' ? 2160 : 1080;
  const long = Math.round((short * 16) / 9 / 2) * 2;
  switch (aspect) {
    case '16:9':
      return { width: long, height: short };
    case '9:16':
      return { width: short, height: long };
    case '1:1':
      return { width: short, height: short };
  }
}

/**
 * Segundos de cola después de la última nota: lo que sigue sonando por el pedal o el sustain,
 * y un margen para editar el video (pedido de Jacobo). El último segundo se desvanece.
 */
export const TAIL = 4;

/** Desvanecido al final del audio exportado (s), para que nunca termine con un corte. */
export const FADE_OUT = 1;

/** Baja el volumen a cero en los últimos `seconds` del audio (lineal, en el lugar). */
export function fadeOut(buffer: AudioBuffer, seconds = FADE_OUT): AudioBuffer {
  const n = Math.min(buffer.length, Math.round(seconds * buffer.sampleRate));
  const from = buffer.length - n;
  for (let c = 0; c < buffer.numberOfChannels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < n; i++) data[from + i] = data[from + i]! * (1 - (i + 1) / n);
  }
  return buffer;
}

/** Cuadros del video: el cuadro N muestra el instante N / fps (ADR-004). */
export function frameCount(duration: number, fps: FrameRate): number {
  return Math.max(1, Math.ceil((duration + TAIL) * fps));
}

export const frameTime = (index: number, fps: FrameRate) => index / fps;

/** Nombre de archivo seguro a partir del título de la toma. */
export function fileName(title: string, extension: string): string {
  const clean = title
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
  return `${clean || 'impromptu'}.${extension}`;
}
