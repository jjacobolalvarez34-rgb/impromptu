import { KEYBOARD_PRESETS, createNoteEvent, createTrack } from '@impromptu/core';
import type { NoteEvent } from '@impromptu/core';
import { describe, expect, it } from 'vitest';
import { layoutKeyboard } from './keyboard-layout';
import {
  BASE_LOOKAHEAD,
  forEachNoteIn,
  frameLayout,
  indexNotes,
  isSounding,
  noteColor,
  noteRect,
  pedalLevels,
} from './scene';
import { burstSeed, noteSparks, rng } from './sparks';
import type { Spark } from './sparks';
import { THEMES, getTheme, hexToNumber } from './themes';

let n = 0;
const note = (pitch: number, start: number, end: number, velocity = 100): NoteEvent =>
  createNoteEvent({ pitch, start, end, velocity, origin: 'midi-file' }, () => `n${++n}`);

const layout = frameLayout(1920, 1080, 1);
const kb = layoutKeyboard(KEYBOARD_PRESETS[61]);

describe('marco', () => {
  it('teclado y pedal abajo; la caída dura BASE_LOOKAHEAD segundos a velocidad 1', () => {
    expect(layout.keyLineY + layout.keyboardHeight + layout.pedalHeight).toBe(1080);
    expect(layout.keyLineY / layout.pps).toBeCloseTo(BASE_LOOKAHEAD, 10);
    expect(frameLayout(1920, 1080, 2).pps).toBeCloseTo(layout.pps * 2, 10);
    // Pedal grande (tutoriales): más del doble de alto, y el teclado sigue llegando abajo.
    const big = frameLayout(1920, 1080, 1, true);
    expect(big.pedalHeight).toBeGreaterThan(layout.pedalHeight * 2);
    expect(big.keyLineY + big.keyboardHeight + big.pedalHeight).toBe(1080);
  });
});

describe('notas visibles', () => {
  const notes = [note(60, 0, 10), note(62, 1, 1.5), note(64, 5, 6), note(65, 20, 21)];
  const index = indexNotes([createTrack({ notes })]);
  const seen = (from: number, to: number) => {
    const out: number[] = [];
    forEachNoteIn(index, from, to, (x) => out.push(x.pitch));
    return out;
  };

  it('encuentra notas largas que empezaron mucho antes', () => {
    expect(index.maxDuration).toBe(10);
    expect(seen(8, 8 + BASE_LOOKAHEAD)).toEqual([60]);
    expect(seen(2, 5)).toEqual([60, 64]);
    expect(seen(11, 14)).toEqual([]);
  });

  it('una nota que aún no llega cae desde arriba; al sonar se recorta en la línea', () => {
    const c = note(60, 1, 2);
    const before = noteRect(c, 0, layout, kb)!;
    expect(before.y + before.height).toBeCloseTo(layout.keyLineY - layout.pps, 6);
    expect(before.height).toBeCloseTo(layout.pps, 6);
    const during = noteRect(c, 1.5, layout, kb)!;
    expect(during.y + during.height).toBe(layout.keyLineY);
    expect(during.height).toBeCloseTo(layout.pps * 0.5, 6);
    expect(noteRect(c, 2.5, layout, kb)).toBeNull();
    expect(noteRect(note(60, 10, 11), 0, layout, kb)).toBeNull();
  });

  it('la nota cae alineada con su tecla y no la pisa a los lados', () => {
    const r = noteRect(note(61, 0, 1), 0, layout, kb)!;
    const key = kb.key(61)!;
    expect(r.x).toBeGreaterThanOrEqual(key.x * 1920);
    expect(r.x + r.width).toBeLessThanOrEqual((key.x + key.width) * 1920);
  });

  it('en vivo la nota nace en la tecla, crece mientras suena y luego sube', () => {
    const held = { ...note(60, 1, 2), end: Infinity };
    const growing = noteRect(held, 1.5, layout, kb, 3, 'rise')!;
    expect(growing.y + growing.height).toBe(layout.keyLineY);
    expect(growing.height).toBeCloseTo(layout.pps * 0.5, 6);
    const released = noteRect(note(60, 1, 2), 2.5, layout, kb, 3, 'rise')!;
    expect(released.y + released.height).toBeCloseTo(layout.keyLineY - layout.pps * 0.5, 6);
    expect(released.height).toBeCloseTo(layout.pps, 6);
    expect(noteRect(note(60, 1, 2), 0.5, layout, kb, 3, 'rise')).toBeNull();
    expect(noteRect(note(60, 1, 2), 10, layout, kb, 3, 'rise')).toBeNull();
  });

  it('las notas fuera del teclado no se dibujan', () => {
    expect(noteRect(note(20, 0, 1), 0, layout, kb)).toBeNull();
  });

  it('las notas muy cortas tienen una altura mínima visible', () => {
    expect(noteRect(note(60, 1, 1.0001), 0, layout, kb)!.height).toBeGreaterThanOrEqual(3);
  });

  it('suena en [start, end)', () => {
    const c = note(60, 1, 2);
    expect([0.99, 1, 1.99, 2].map((t) => isSounding(c, t))).toEqual([false, true, true, false]);
  });
});

describe('colores', () => {
  const colors = { right: '#FF9F1C', left: '#E8E4DC', unassigned: '#9A968C' };
  it('sin mano usa el color "sin asignar"; con mano, el de esa mano', () => {
    const x = note(60, 0, 1);
    expect(noteColor(x, colors)).toBe('#9A968C');
    expect(noteColor({ ...x, hand: 'R' }, colors)).toBe('#FF9F1C');
    expect(noteColor({ ...x, hand: 'L' }, colors)).toBe('#E8E4DC');
  });

  it('las dos manos pueden tener el mismo color (es personalización)', () => {
    const same = { right: '#FF9F1C', left: '#FF9F1C', unassigned: '#FF9F1C' };
    expect(noteColor({ ...note(60, 0, 1), hand: 'L' }, same)).toBe('#FF9F1C');
  });

  it('temas y conversión de colores', () => {
    expect(getTheme('no-existe')).toBe(THEMES.ambar);
    expect(getTheme('sala').name).toBe('Sala');
    expect(hexToNumber('#FF9F1C')).toBe(0xff9f1c);
    expect(hexToNumber('rojo')).toBe(0x9a968c);
  });
});

describe('pedal', () => {
  it('nivel de cada pedal entre 0 y 1, con medio pedal', () => {
    const levels = pedalLevels(
      [
        { kind: 'sustain', time: 0, value: 127 },
        { kind: 'sustain', time: 1, value: 64 },
        { kind: 'soft', time: 0.5, value: 127 },
      ],
      1.2,
    );
    expect(levels).toEqual({ sustain: 64 / 127, sostenuto: 0, soft: 1 });
  });
});

describe('chispas', () => {
  const opts = { amount: 62, originX: 500, originY: 900, keyWidth: 30, scale: 1 };
  const at = (x: NoteEvent, t: number) => {
    const out: Spark[] = [];
    noteSparks(x, t, opts, out);
    return out;
  };

  it('mismo t = mismas chispas (B-012)', () => {
    const x = note(60, 1, 3);
    expect(at(x, 1.37)).toEqual(at({ ...x, id: 'otro-id' }, 1.37));
    expect(at(x, 1.37).length).toBeGreaterThan(0);
  });

  it('no hay chispas antes del ataque ni con el deslizador en 0', () => {
    expect(at(note(60, 1, 3), 0.99)).toEqual([]);
    const out: Spark[] = [];
    noteSparks(note(60, 1, 3), 1.2, { ...opts, amount: 0 }, out);
    expect(out).toEqual([]);
  });

  it('se apagan después de soltar la tecla', () => {
    const x = note(60, 1, 1.2);
    expect(at(x, 1.3).length).toBeGreaterThan(0);
    expect(at(x, 2.5)).toEqual([]);
  });

  it('suben desde la tecla y se desvanecen', () => {
    const sparks = at(note(60, 0, 2), 0.1);
    expect(sparks.every((s) => s.alpha > 0 && s.alpha <= 1)).toBe(true);
    expect(sparks.some((s) => s.y < opts.originY)).toBe(true);
  });

  it('el generador y las semillas son estables', () => {
    const a = rng(42);
    const b = rng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    expect(burstSeed({ pitch: 60, start: 1 }, 0)).toBe(burstSeed({ pitch: 60, start: 1 }, 0));
    expect(burstSeed({ pitch: 60, start: 1 }, 0)).not.toBe(burstSeed({ pitch: 61, start: 1 }, 0));
  });
});
