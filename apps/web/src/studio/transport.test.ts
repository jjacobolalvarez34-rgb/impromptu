import { describe, expect, it } from 'vitest';
import { Transport, formatTime } from './transport';

/** Reloj de prueba que se avanza a mano. */
function fakeClock() {
  let now = 0;
  return { clock: () => now, advance: (s: number) => (now += s) };
}

describe('Transport', () => {
  it('avanza con el reloj y respeta la velocidad', () => {
    const c = fakeClock();
    const t = new Transport(c.clock);
    t.duration = 10;
    t.play();
    c.advance(2);
    expect(t.now()).toBe(2);
    t.setSpeed(0.5);
    c.advance(2);
    expect(t.now()).toBe(3);
  });

  it('al llegar al final se detiene sin colgarse y avisa una vez', () => {
    const c = fakeClock();
    const t = new Transport(c.clock);
    t.duration = 5;
    let events = 0;
    t.subscribe(() => events++);
    t.play();
    events = 0;
    c.advance(6);
    expect(t.now()).toBe(5);
    expect(t.playing).toBe(false);
    expect(events).toBe(1);
    // Reproducir otra vez empieza desde el inicio.
    t.play();
    c.advance(1);
    expect(t.now()).toBe(1);
  });

  it('repite la sección marcada', () => {
    const c = fakeClock();
    const t = new Transport(c.clock);
    t.duration = 20;
    t.loop = { start: 4, end: 6 };
    t.seek(4);
    t.play();
    c.advance(3);
    expect(t.now()).toBeCloseTo(5, 10);
    expect(t.playing).toBe(true);
  });

  it('cambiar de reloj no salta de posición', () => {
    const a = fakeClock();
    const t = new Transport(a.clock);
    t.duration = 10;
    t.play();
    a.advance(3);
    const b = fakeClock();
    b.advance(100);
    t.setClock(b.clock);
    expect(t.now()).toBe(3);
    b.advance(1);
    expect(t.now()).toBe(4);
  });

  it('formato del LCD', () => {
    expect(formatTime(84.36)).toBe('01:24.36');
    expect(formatTime(0)).toBe('00:00.00');
  });
});
