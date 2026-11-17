import { describe, expect, it } from 'vitest';
import { TAIL, fileName, frameCount, frameSize, frameTime } from './formats';

describe('formatos de video', () => {
  it('1080p y 4K en 16:9, 9:16 y 1:1, siempre con lados pares', () => {
    expect(frameSize('16:9', '1080p')).toEqual({ width: 1920, height: 1080 });
    expect(frameSize('9:16', '1080p')).toEqual({ width: 1080, height: 1920 });
    expect(frameSize('1:1', '1080p')).toEqual({ width: 1080, height: 1080 });
    expect(frameSize('16:9', '4k')).toEqual({ width: 3840, height: 2160 });
    expect(frameSize('9:16', '4k')).toEqual({ width: 2160, height: 3840 });
    for (const a of ['16:9', '9:16', '1:1'] as const) {
      for (const r of ['1080p', '4k'] as const) {
        const { width, height } = frameSize(a, r);
        expect(width % 2).toBe(0);
        expect(height % 2).toBe(0);
      }
    }
  });

  it('el cuadro N es el instante N / fps (ADR-004)', () => {
    expect(frameTime(0, 60)).toBe(0);
    expect(frameTime(60, 60)).toBe(1);
    expect(frameTime(45, 30)).toBe(1.5);
  });

  it('cuenta los cuadros con la cola incluida', () => {
    expect(frameCount(10, 30)).toBe(Math.ceil((10 + TAIL) * 30));
    expect(frameCount(0, 60)).toBe(Math.ceil(TAIL * 60));
  });

  it('nombres de archivo sin tildes ni símbolos', () => {
    expect(fileName('Nocturno en mi bemol', 'mp4')).toBe('nocturno-en-mi-bemol.mp4');
    expect(fileName('Canción ñ #1!', 'webm')).toBe('cancion-n-1.webm');
    expect(fileName('???', 'mp4')).toBe('impromptu.mp4');
  });
});
