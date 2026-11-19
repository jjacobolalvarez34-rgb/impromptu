import { describe, expect, it } from 'vitest';
import { archivosDe, bancoDe, golpeBateria, zonaCuerda } from './muestras';
import type { CapaBateria, ZonaCuerda } from './muestras';

const zonas: ZonaCuerda[] = [
  { nota: 40, hastaFuerza: 82, archivo: 'E2-suave.flac' },
  { nota: 40, hastaFuerza: 127, archivo: 'E2-fuerte.flac' },
  { nota: 43, hastaFuerza: 127, archivo: 'G2.flac' },
];

describe('sonidos grabados', () => {
  it('cada instrumento usa su banco (la guitarra, el timbre elegido)', () => {
    expect(bancoDe('drums', 'nylon')).toBe('bateria');
    expect(bancoDe('bass', 'nylon')).toBe('bajo');
    expect(bancoDe('guitar', 'electrica')).toBe('electrica');
    expect(bancoDe('piano', 'acero')).toBeNull();
  });

  it('la cuerda usa la nota grabada más cercana y la lleva a su altura', () => {
    const exacta = zonaCuerda(zonas, 43, 100)!;
    expect(exacta.zona.archivo).toBe('G2.flac');
    expect(exacta.rate).toBe(1);
    const arriba = zonaCuerda(zonas, 41, 100)!;
    expect(arriba.zona.nota).toBe(40);
    expect(arriba.rate).toBeCloseTo(Math.pow(2, 1 / 12));
    // 42 está a 2 semitonos del 40 y a 1 del 43.
    expect(zonaCuerda(zonas, 42, 100)!.zona.nota).toBe(43);
  });

  it('la capa de la cuerda depende de la fuerza', () => {
    expect(zonaCuerda(zonas, 40, 60)!.zona.archivo).toBe('E2-suave.flac');
    expect(zonaCuerda(zonas, 40, 82)!.zona.archivo).toBe('E2-suave.flac');
    expect(zonaCuerda(zonas, 40, 83)!.zona.archivo).toBe('E2-fuerte.flac');
  });

  it('el golpe de batería toma la capa por fuerza y turna las variaciones', () => {
    const piezas: Record<string, CapaBateria[]> = {
      38: [
        { hastaFuerza: 65, archivos: ['s1.flac', 's2.flac'] },
        { hastaFuerza: 127, archivos: ['f1.flac', 'f2.flac'] },
      ],
    };
    expect(golpeBateria(piezas, 38, 40, 0)).toBe('s1.flac');
    expect(golpeBateria(piezas, 38, 40, 1)).toBe('s2.flac');
    expect(golpeBateria(piezas, 38, 120, 2)).toBe('f1.flac');
    expect(golpeBateria(piezas, 56, 100, 0)).toBeNull();
    expect(
      archivosDe({ nombre: 'bateria', autor: '', licencia: '', ganancia: 1, piezas }),
    ).toHaveLength(4);
  });
});
