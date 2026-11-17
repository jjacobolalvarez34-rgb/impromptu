import type { Take } from '@impromptu/core';

/**
 * Tomas guardadas en IndexedDB del navegador (ARQUITECTURA: almacenamiento).
 * Nada sale del equipo. Un envoltorio mínimo, sin dependencias.
 */
const DB_NAME = 'impromptu';
const STORE = 'takes';
const VERSION = 1;

export interface TakeSummary {
  id: string;
  title: string;
  createdAt: string;
  duration: number;
  notes: number;
}

let opening: Promise<IDBDatabase> | null = null;

function db(): Promise<IDBDatabase> {
  opening ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return opening;
}

function run<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return db().then(
    (database) =>
      new Promise<T>((resolve, reject) => {
        const req = fn(database.transaction(STORE, mode).objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export const saveTake = (take: Take) => run('readwrite', (s) => s.put(take)).then(() => undefined);
export const loadTake = (id: string) => run<Take | undefined>('readonly', (s) => s.get(id));
export const deleteTake = (id: string) => run('readwrite', (s) => s.delete(id));

export async function listTakes(): Promise<TakeSummary[]> {
  const takes = await run<Take[]>('readonly', (s) => s.getAll());
  return takes
    .map((t) => ({
      id: t.id,
      title: t.title,
      createdAt: t.createdAt,
      duration: t.duration,
      notes: t.tracks.reduce((n, tr) => n + tr.notes.length, 0),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function renameTake(id: string, title: string): Promise<void> {
  const take = await loadTake(id);
  if (take) await saveTake({ ...take, title });
}
