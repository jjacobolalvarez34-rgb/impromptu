import { exportMidi } from '@impromptu/midi';
import type { Take } from '@impromptu/core';

/** Nombre de archivo seguro a partir del título de la toma. */
export function midiFileName(title: string): string {
  const clean = title
    .normalize('NFC')
    .replace(/[\\/:*?"<>|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return `${clean || 'impromptu'}.mid`;
}

/** Descarga la toma como .mid (notas, manos en pistas separadas y pedales). */
export function saveMidi(take: Take): void {
  const bytes = exportMidi(take);
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'audio/midi' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = midiFileName(take.title);
  document.body.append(a);
  a.click();
  a.remove();
  // Se libera después: algunos navegadores leen la URL de forma asíncrona al descargar.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
