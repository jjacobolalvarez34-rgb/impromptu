import { createNoteEvent, createTake, createTrack, fitKeyboardRange } from '@impromptu/core';
import type { NoteEvent, Take } from '@impromptu/core';
import { importMidi } from '@impromptu/midi';
import type { ImportWarning } from '@impromptu/midi';

export interface OpenedTake {
  take: Take;
  notices: string[];
}

/** Avisos del lector de MIDI en la voz de la interfaz (DESIGN §7). */
export function describeWarning(w: ImportWarning): string {
  switch (w.code) {
    case 'duplicate-track-removed':
      return `Quitamos la pista "${w.track}" porque repite las notas de "${w.duplicateOf}".`;
    case 'unclosed-notes':
      return `${w.count} notas de "${w.track}" no tenían final; las cerramos al terminar la pista.`;
    case 'no-notes':
      return 'Este archivo no tiene notas. Revisa que sea la pista de piano y vuelve a intentar.';
  }
}

export async function openMidiFile(file: File): Promise<OpenedTake> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const title = file.name.replace(/\.midi?$/i, '');
  const { take, warnings } = importMidi(bytes, { title });
  return { take, notices: warnings.map(describeWarning) };
}

/**
 * Piezas de Jacobo en fixtures/jacobo (solo existen en su equipo, P11).
 * En otros equipos y en CI la lista queda vacía.
 */
const localPieces = import.meta.glob('../../../../fixtures/jacobo/*.mid', {
  query: '?url',
  import: 'default',
}) as Record<string, () => Promise<string>>;

export const LOCAL_PIECES = Object.keys(localPieces)
  .map((path) => ({ path, name: prettyName(path) }))
  .sort((a, b) => a.name.localeCompare(b.name));

export async function openLocalPiece(path: string): Promise<OpenedTake> {
  const load = localPieces[path];
  if (!load) throw new Error(`No existe ${path}`);
  const res = await fetch(await load());
  const blob = await res.blob();
  return openMidiFile(new File([blob], `${prettyName(path)}.mid`));
}

function prettyName(path: string): string {
  const base = path
    .split('/')
    .pop()!
    .replace(/\.mid$/i, '')
    .replace(/-/g, ' ');
  return base.charAt(0).toUpperCase() + base.slice(1);
}

/**
 * Prueba de rendimiento (ROADMAP fase 1, punto 6): mantiene unas 2.000 notas en pantalla
 * a velocidad de caída 1 (3 s visibles), recorriendo las 61 teclas.
 */
export function createDemoTake(visibleNotes = 2000, seconds = 30): Take {
  const lookahead = 3;
  const noteLength = 0.18;
  const perSecond = visibleNotes / lookahead;
  const step = 1 / perSecond;
  const notes: NoteEvent[] = [];
  let i = 0;
  for (let t = 0; t < seconds; t += step, i++) {
    const pitch = 36 + ((i * 7) % 61);
    notes.push(
      createNoteEvent({
        pitch,
        start: t,
        end: t + noteLength,
        velocity: 40 + ((i * 13) % 87),
        origin: 'edit',
      }),
    );
  }
  const track = createTrack({ name: 'Prueba', notes });
  return createTake({
    title: `Prueba de ${visibleNotes.toLocaleString('es')} notas`,
    tracks: [track],
    keyboardRange: fitKeyboardRange(notes.map((n) => n.pitch)),
  });
}
