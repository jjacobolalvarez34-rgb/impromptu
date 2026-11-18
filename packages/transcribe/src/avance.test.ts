import { describe, expect, it } from 'vitest';
import { AvanceSuave, fraseDeEspera, textoRestante } from './avance';

describe('avance suave', () => {
  it('se mueve aunque la IA todavía no haya avisado nada', () => {
    const a = new AvanceSuave(0, 0.1);
    expect(a.valor(5_000)).toBeGreaterThan(0);
    expect(a.valor(10_000)).toBeGreaterThan(a.valor(5_000));
    expect(a.valor(600_000)).toBeLessThan(0.1);
  });

  it('sigue al ritmo medido sin pasarse del siguiente tramo', () => {
    const a = new AvanceSuave(0, 0.25);
    a.actualizar(0.25, 10_000);
    expect(a.valor(15_000)).toBeCloseTo(0.375);
    expect(a.valor(60_000)).toBeLessThanOrEqual(0.25 + 0.25 * 0.95);
    expect(a.restante(10_000)).toBeCloseTo(30);
  });

  it('nunca retrocede con un aviso viejo', () => {
    const a = new AvanceSuave(0);
    a.actualizar(0.5, 1000);
    a.actualizar(0.4, 2000);
    expect(a.valor(2000)).toBeGreaterThanOrEqual(0.5);
  });

  it('frases y tiempo restante en español', () => {
    expect(fraseDeEspera('escuchando', 0)).toBe('Escuchando nota por nota…');
    expect(fraseDeEspera('escuchando', 4600)).not.toBe('Escuchando nota por nota…');
    expect(textoRestante(42)).toBe('Faltan unos 40 s');
    expect(textoRestante(300)).toBe('Faltan unos 5 min');
    expect(textoRestante(3)).toBe('Falta poco');
    expect(textoRestante(null)).toBeNull();
  });
});
