import { describe, expect, it } from 'vitest';
import { PEDAL_CC, isPedalDown, pedalKindFromCC, pedalValueAt } from './pedal';
import type { PedalEvent } from './model';

describe('pedales', () => {
  it('mapea CC64/66/67 en ambos sentidos', () => {
    for (const [kind, cc] of Object.entries(PEDAL_CC)) {
      expect(pedalKindFromCC(cc)).toBe(kind);
    }
    expect(pedalKindFromCC(1)).toBeNull();
    expect(pedalKindFromCC(65)).toBeNull();
  });

  it('pisado desde 64, para pedales que no mandan solo 0/127 (B-004)', () => {
    expect(isPedalDown(0)).toBe(false);
    expect(isPedalDown(63)).toBe(false);
    expect(isPedalDown(64)).toBe(true);
    expect(isPedalDown(127)).toBe(true);
  });

  it('pedalValueAt sigue cada pedal por separado', () => {
    const pedals: PedalEvent[] = [
      { kind: 'sustain', time: 1, value: 127 },
      { kind: 'soft', time: 1.5, value: 90 },
      { kind: 'sustain', time: 2, value: 40 },
      { kind: 'sustain', time: 3, value: 0 },
    ];
    expect(pedalValueAt(pedals, 'sustain', 0.5)).toBe(0);
    expect(pedalValueAt(pedals, 'sustain', 1)).toBe(127);
    expect(pedalValueAt(pedals, 'sustain', 2.5)).toBe(40);
    expect(pedalValueAt(pedals, 'sustain', 10)).toBe(0);
    expect(pedalValueAt(pedals, 'soft', 2.5)).toBe(90);
    expect(pedalValueAt(pedals, 'sostenuto', 2.5)).toBe(0);
  });
});
