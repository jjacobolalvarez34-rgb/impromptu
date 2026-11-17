import { describe, expect, it } from 'vitest';
import { calibratedKeyLine, calibratedKeyboard, coverRect } from './calibration';

describe('calibración sobre el video', () => {
  it('el video cubre el cuadro y se centra', () => {
    expect(coverRect(1920, 1080, 1280, 720)).toEqual({ x: 0, y: 0, width: 1920, height: 1080 });
    const r = coverRect(1080, 1920, 1920, 1080);
    expect(r.height).toBe(1920);
    expect(r.x).toBeLessThan(0);
  });

  it('las teclas marcadas quedan donde el usuario hizo clic', () => {
    const rect = coverRect(1920, 1080, 1920, 1080);
    const cal = {
      lowKey: { pitch: 36, x: 0.1, y: 0.8 },
      highKey: { pitch: 96, x: 0.9, y: 0.8 },
      keyLineY: 0.7,
    };
    const kb = calibratedKeyboard(cal, rect, 1920);
    const center = (p: number) => (kb.key(p)!.x + kb.key(p)!.width / 2) * 1920;
    expect(center(36)).toBeCloseTo(0.1 * 1920, 6);
    expect(center(96)).toBeCloseTo(0.9 * 1920, 6);
    // Do central queda entre las dos y en orden.
    expect(center(60)).toBeGreaterThan(center(36));
    expect(center(60)).toBeLessThan(center(96));
    expect(calibratedKeyLine(cal, rect)).toBeCloseTo(756, 6);
  });

  it('acepta las teclas marcadas en orden inverso', () => {
    const rect = coverRect(1000, 500, 1000, 500);
    const kb = calibratedKeyboard(
      {
        lowKey: { pitch: 96, x: 0.9, y: 0.5 },
        highKey: { pitch: 36, x: 0.1, y: 0.5 },
        keyLineY: 0.5,
      },
      rect,
      1000,
    );
    expect((kb.key(36)!.x + kb.key(36)!.width / 2) * 1000).toBeCloseTo(100, 6);
  });
});
