import { describe, expect, it } from 'vitest';
import { LivePlayer } from './live';
import type { Strikeable } from './live';

/** Piano de prueba que registra qué suena y qué se apaga. */
function fakePiano() {
  let n = 0;
  const log: string[] = [];
  const piano: Strikeable<string> = {
    strike: (pitch, velocity, gain = 1) => {
      const id = `${pitch}#${++n}`;
      log.push(`on ${id} v${velocity} g${gain}`);
      return id;
    },
    // `cut`: se corta de una vez (repetir tecla, reset); `off`: se suelta (con su cola).
    damp: (id, quick) => log.push(`${quick ? 'cut' : 'off'} ${id}`),
  };
  return { piano, log };
}

describe('LivePlayer', () => {
  it('suena al tocar y se apaga al soltar', () => {
    const { piano, log } = fakePiano();
    const live = new LivePlayer(piano);
    live.noteOn(60, 90);
    live.noteOff(60);
    expect(log).toEqual(['on 60#1 v90 g1', 'off 60#1']);
  });

  it('con sustain, las notas siguen hasta soltar el pedal', () => {
    const { piano, log } = fakePiano();
    const live = new LivePlayer(piano);
    live.pedal('sustain', 127);
    live.noteOn(60, 90);
    live.noteOff(60);
    expect(log).toEqual(['on 60#1 v90 g1']);
    live.pedal('sustain', 0);
    expect(log).toEqual(['on 60#1 v90 g1', 'off 60#1']);
  });

  it('soltar el sustain no apaga las teclas que siguen abajo', () => {
    const { piano, log } = fakePiano();
    const live = new LivePlayer(piano);
    live.pedal('sustain', 127);
    live.noteOn(60, 90);
    live.pedal('sustain', 0);
    expect(log).toEqual(['on 60#1 v90 g1']);
  });

  it('el sostenuto solo retiene las teclas que estaban abajo al pisarlo', () => {
    const { piano, log } = fakePiano();
    const live = new LivePlayer(piano);
    live.noteOn(48, 80);
    live.pedal('sostenuto', 127);
    live.noteOff(48);
    live.noteOn(72, 80);
    live.noteOff(72);
    expect(log).toEqual(['on 48#1 v80 g1', 'on 72#2 v80 g1', 'off 72#2']);
    live.pedal('sostenuto', 0);
    expect(log.at(-1)).toBe('off 48#1');
  });

  it('repetir una tecla corta la nota anterior de una vez y una corda suaviza', () => {
    const { piano, log } = fakePiano();
    const live = new LivePlayer(piano);
    live.pedal('sustain', 127);
    live.noteOn(60, 90);
    live.noteOff(60);
    live.pedal('soft', 127);
    live.noteOn(60, 50);
    expect(log).toEqual(['on 60#1 v90 g1', 'cut 60#1', 'on 60#2 v50 g0.72']);
  });

  it('reset apaga todo', () => {
    const { piano, log } = fakePiano();
    const live = new LivePlayer(piano);
    live.noteOn(60, 90);
    live.noteOn(64, 90);
    live.reset();
    expect(log.filter((l) => l.startsWith('cut'))).toHaveLength(2);
  });
});
