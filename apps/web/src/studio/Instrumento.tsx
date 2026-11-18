import {
  AFINACIONES,
  asignarTrastes,
  createNoteEvent,
  createTake,
  createTrack,
} from '@impromptu/core';
import type { Instrument, Take } from '@impromptu/core';
import type { Golpe } from '@impromptu/transcribe';
import { Chips } from '@impromptu/ui';
import { useStudio } from './store';

/** Instrumentos que se eligen en el estudio (fase 9). */
export const INSTRUMENTOS = [
  { value: 'piano', label: 'Piano' },
  { value: 'guitar', label: 'Guitarra' },
  { value: 'bass', label: 'Bajo' },
  { value: 'drums', label: 'Batería' },
] as const satisfies readonly { value: Instrument; label: string }[];

/** "guitarra" o "guitar" en la dirección (?instrumento=…) → el instrumento. */
export function instrumentoDeTexto(texto: string | null): Instrument | null {
  const t = (texto ?? '').toLowerCase();
  if (t === 'piano') return 'piano';
  if (t === 'guitarra' || t === 'guitar') return 'guitar';
  if (t === 'bajo' || t === 'bass') return 'bass';
  if (t === 'bateria' || t === 'batería' || t === 'drums') return 'drums';
  return null;
}

/**
 * Pasa una toma al instrumento elegido: sus pistas quedan con él y, en guitarra y bajo, cada nota
 * con su cuerda y traste (el recorrido más cómodo para la mano).
 */
export function conInstrumento(take: Take, instrumento: Instrument): Take {
  if (instrumento === 'piano') return take;
  const afinacion =
    instrumento === 'bass'
      ? AFINACIONES.bajo
      : AFINACIONES[useStudio.getState().guitarra.afinacion];
  return {
    ...take,
    tracks: take.tracks.map((t) => ({
      ...t,
      instrument: instrumento,
      name: INSTRUMENTOS.find((i) => i.value === instrumento)!.label,
      notes: instrumento === 'drums' ? t.notes : asignarTrastes(t.notes, afinacion),
      pedals: [],
    })),
  };
}

/** Toma de batería a partir de los golpes detectados en un audio. */
export function tomaDeGolpes(golpes: readonly Golpe[], title: string, duration: number): Take {
  const notes = golpes.map((g) =>
    createNoteEvent({
      pitch: g.nota,
      start: g.tiempo,
      end: g.tiempo + 0.1,
      velocity: g.fuerza,
      origin: 'audio',
    }),
  );
  return createTake({
    title,
    tracks: [createTrack({ instrument: 'drums', name: 'Batería', notes })],
    duration: Math.max(duration, ...notes.map((n) => n.end), 0),
  });
}

/** Selector del instrumento con el que se graba y se convierte. */
export function ElegirInstrumento() {
  const instrumento = useStudio((s) => s.instrumento);
  return (
    <Chips
      label="Instrumento"
      options={INSTRUMENTOS}
      value={instrumento}
      onChange={(v) => useStudio.getState().setInstrumento(v)}
    />
  );
}
