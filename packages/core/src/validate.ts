import type { NoteEvent, PedalEvent, Take, Track } from './model';

const isInt = (n: number, min: number, max: number) => Number.isInteger(n) && n >= min && n <= max;
const isTime = (t: number) => Number.isFinite(t) && t >= 0;

/** Lista de problemas de una nota (vacía si es válida). */
export function validateNoteEvent(n: NoteEvent): string[] {
  const errors: string[] = [];
  if (!isInt(n.pitch, 0, 127)) errors.push(`pitch fuera de 0–127: ${n.pitch}`);
  if (!isInt(n.velocity, 1, 127)) errors.push(`velocity fuera de 1–127: ${n.velocity}`);
  if (!isTime(n.start)) errors.push(`start inválido: ${n.start}`);
  if (!Number.isFinite(n.end) || n.end < n.start) errors.push(`end antes de start: ${n.end}`);
  if (n.hand === null && n.handSource !== null) errors.push('handSource sin hand');
  if (n.finger === null && n.fingerSource !== null) errors.push('fingerSource sin finger');
  return errors;
}

export function validatePedalEvent(p: PedalEvent): string[] {
  const errors: string[] = [];
  if (!isInt(p.value, 0, 127)) errors.push(`valor de pedal fuera de 0–127: ${p.value}`);
  if (!isTime(p.time)) errors.push(`time inválido: ${p.time}`);
  return errors;
}

export function validateTrack(t: Track): string[] {
  const errors: string[] = [];
  t.notes.forEach((n, i) => {
    for (const e of validateNoteEvent(n)) errors.push(`nota ${i}: ${e}`);
    const prev = t.notes[i - 1];
    if (prev && prev.start > n.start) errors.push(`nota ${i}: notas sin ordenar por start`);
  });
  t.pedals.forEach((p, i) => {
    for (const e of validatePedalEvent(p)) errors.push(`pedal ${i}: ${e}`);
    const prev = t.pedals[i - 1];
    if (prev && prev.time > p.time) errors.push(`pedal ${i}: pedales sin ordenar por time`);
  });
  return errors;
}

export function validateTake(take: Take): string[] {
  const errors: string[] = [];
  const { low, high } = take.keyboardRange;
  if (!isInt(low, 0, 127) || !isInt(high, 0, 127) || low > high) {
    errors.push(`keyboardRange inválido: ${low}–${high}`);
  }
  if (!isTime(take.duration)) errors.push(`duration inválida: ${take.duration}`);
  take.tracks.forEach((t, i) => {
    for (const e of validateTrack(t)) errors.push(`pista ${i}: ${e}`);
  });
  take.tempoMap.forEach((tp, i) => {
    if (!(tp.bpm > 0)) errors.push(`tempo ${i}: bpm debe ser > 0`);
  });
  return errors;
}
