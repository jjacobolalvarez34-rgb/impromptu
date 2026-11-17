import { sortNotes, takeEnd } from '@impromptu/core';
import type { Finger, Hand, NoteEvent, Take } from '@impromptu/core';
import { separateHands, suggestFingering } from '@impromptu/practice';
import type { HandSize } from '@impromptu/practice';

/**
 * Ediciones de una toma (ROADMAP fase 4). Todas son puras: devuelven una toma nueva, así
 * el estudio puede deshacer y rehacer guardando las anteriores.
 */

type NoteMap = (note: NoteEvent) => NoteEvent | null;

function mapNotes(take: Take, ids: ReadonlySet<string>, fn: NoteMap): Take {
  const tracks = take.tracks.map((t) => ({
    ...t,
    notes: sortNotes(
      t.notes.flatMap((n) => {
        if (!ids.has(n.id)) return [n];
        const out = fn(n);
        return out ? [out] : [];
      }),
    ),
  }));
  return { ...take, tracks, duration: Math.max(take.duration, takeEnd(tracks)) };
}

/** Recalcula los dedos automáticos de cada mano; los fijados por el usuario son anclas. */
function refinger(take: Take, size: HandSize): Take {
  const tracks = take.tracks.map((t) => {
    const byId = new Map<string, NoteEvent>();
    for (const hand of ['L', 'R'] as const) {
      for (const n of suggestFingering(
        t.notes.filter((x) => x.hand === hand),
        hand,
        { handSize: size },
      )) {
        byId.set(n.id, n);
      }
    }
    return { ...t, notes: t.notes.map((n) => byId.get(n.id) ?? n) };
  });
  return { ...take, tracks };
}

/** Separa manos y sugiere dedos en toda la toma, sin tocar lo que fijó el usuario. */
export function autoAssign(take: Take, size: HandSize): Take {
  const tracks = take.tracks.map((t) =>
    t.instrument === 'piano' ? { ...t, notes: separateHands(t.notes) } : t,
  );
  return refinger({ ...take, tracks }, size);
}

/** ¿La toma todavía no tiene manos asignadas? */
export const hasNoHands = (take: Take) =>
  take.tracks.every((t) => t.notes.every((n) => n.hand === null));

export function setHand(take: Take, ids: ReadonlySet<string>, hand: Hand, size: HandSize): Take {
  const changed = mapNotes(take, ids, (n) => ({ ...n, hand, handSource: 'user' }));
  return refinger(changed, size);
}

/** Fija un dedo (ancla) o, con null, lo devuelve a automático. Luego recalcula esa mano. */
export function setFinger(
  take: Take,
  ids: ReadonlySet<string>,
  finger: Finger | null,
  size: HandSize,
): Take {
  const changed = mapNotes(take, ids, (n) =>
    finger === null
      ? { ...n, finger: null, fingerSource: null }
      : { ...n, finger, fingerSource: 'user' },
  );
  return refinger(changed, size);
}

/** Mueve las notas en el tiempo (s); nunca antes de 0. */
export function shiftNotes(take: Take, ids: ReadonlySet<string>, dt: number): Take {
  return mapNotes(take, ids, (n) => {
    const move = Math.max(dt, -n.start);
    return { ...n, start: n.start + move, end: n.end + move, origin: 'edit' };
  });
}

/** Alarga o acorta las notas (s); una nota dura al menos 30 ms. */
export function resizeNotes(take: Take, ids: ReadonlySet<string>, dEnd: number): Take {
  return mapNotes(take, ids, (n) => ({
    ...n,
    end: Math.max(n.start + 0.03, n.end + dEnd),
    origin: 'edit',
  }));
}

/** Sube o baja las notas por semitonos, dentro del rango MIDI. */
export function transposeNotes(take: Take, ids: ReadonlySet<string>, semitones: number): Take {
  return mapNotes(take, ids, (n) => ({
    ...n,
    pitch: Math.min(127, Math.max(0, n.pitch + semitones)),
    origin: 'edit',
  }));
}

export function removeNotes(take: Take, ids: ReadonlySet<string>): Take {
  return mapNotes(take, ids, () => null);
}
