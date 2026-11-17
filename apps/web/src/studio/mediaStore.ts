/**
 * Archivos de video y audio de las tomas en OPFS (ARQUITECTURA: almacenamiento). Viven en
 * el equipo del usuario; Take.media guarda solo la clave (MediaRef.storageKey).
 */
const FOLDER = 'medios';

async function folder(): Promise<FileSystemDirectoryHandle> {
  const root = await navigator.storage.getDirectory();
  return root.getDirectoryHandle(FOLDER, { create: true });
}

export async function saveMedia(file: Blob, key: string): Promise<void> {
  const handle = await (await folder()).getFileHandle(key, { create: true });
  const writable = await handle.createWritable();
  await writable.write(file);
  await writable.close();
}

export async function loadMedia(key: string): Promise<File | null> {
  try {
    const handle = await (await folder()).getFileHandle(key);
    return await handle.getFile();
  } catch {
    return null;
  }
}

export async function deleteMedia(key: string): Promise<void> {
  try {
    await (await folder()).removeEntry(key);
  } catch {
    // Ya no estaba.
  }
}
