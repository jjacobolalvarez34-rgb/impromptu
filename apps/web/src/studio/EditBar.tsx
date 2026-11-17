import type { Finger, Hand } from '@impromptu/core';
import { IconButton } from '@impromptu/ui';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Minus, Plus, Trash2, X } from 'lucide-react';
import { useEffect } from 'react';
import { removeNotes, resizeNotes, setFinger, setHand, shiftNotes, transposeNotes } from './edit';
import { transport, useStudio } from './store';
import styles from './EditBar.module.css';

const STEP = 0.05; // s al mover o alargar

/** Acciones de edición sobre la selección (también con el teclado). */
export const editActions = {
  hand(hand: Hand) {
    const { selection, handSize, edit } = useStudio.getState();
    edit((t) => setHand(t, new Set(selection), hand, handSize));
  },
  finger(finger: Finger | null) {
    const { selection, handSize, edit } = useStudio.getState();
    edit((t) => setFinger(t, new Set(selection), finger, handSize));
  },
  move(dt: number) {
    const { selection, edit } = useStudio.getState();
    edit((t) => shiftNotes(t, new Set(selection), dt));
  },
  resize(d: number) {
    const { selection, edit } = useStudio.getState();
    edit((t) => resizeNotes(t, new Set(selection), d));
  },
  transpose(semitones: number) {
    const { selection, edit } = useStudio.getState();
    edit((t) => transposeNotes(t, new Set(selection), semitones));
  },
  remove() {
    const { selection, edit, select } = useStudio.getState();
    edit((t) => removeNotes(t, new Set(selection)));
    select([]);
  },
};

/** Atajos del editor. Solo actúan con la pieza pausada y fuera de los campos de texto. */
export function useEditShortcuts(): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable="true"], dialog')) return;
      const { selection, undo, redo, select } = useStudio.getState();
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key.toLowerCase() === 'z' && !e.shiftKey)
        return void (e.preventDefault(), undo());
      if (ctrl && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        return void (e.preventDefault(), redo());
      }
      if (selection.length === 0 || transport.playing || ctrl) return;
      const k = e.key;
      let handled = true;
      if (k >= '1' && k <= '5') editActions.finger(Number(k) as Finger);
      else if (k === '0') editActions.finger(null);
      else if (k.toLowerCase() === 'i') editActions.hand('L');
      else if (k.toLowerCase() === 'd') editActions.hand('R');
      else if (k === 'ArrowLeft') editActions.move(-STEP);
      else if (k === 'ArrowRight') editActions.move(STEP);
      else if (k === 'ArrowUp') editActions.transpose(1);
      else if (k === 'ArrowDown') editActions.transpose(-1);
      else if (k === 'Delete' || k === 'Backspace') editActions.remove();
      else if (k === 'Escape') select([]);
      else handled = false;
      if (handled) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

/** Barra flotante sobre el visualizador cuando hay notas seleccionadas. */
export function EditBar() {
  const selection = useStudio((s) => s.selection);
  const take = useStudio((s) => s.take);
  if (selection.length === 0 || !take) return null;
  const selected = take.tracks.flatMap((t) => t.notes).filter((n) => selection.includes(n.id));
  const hand = selected.every((n) => n.hand === selected[0]?.hand) ? selected[0]?.hand : null;
  const finger = selected.every((n) => n.finger === selected[0]?.finger)
    ? selected[0]?.finger
    : null;

  return (
    <div className={styles.barra} role="toolbar" aria-label="Editar notas seleccionadas">
      <span className={styles.cuenta}>
        {selected.length} {selected.length === 1 ? 'nota' : 'notas'}
      </span>
      <div className={styles.grupo} role="group" aria-label="Mano">
        {(['L', 'R'] as const).map((h) => (
          <button
            key={h}
            type="button"
            className={styles.chip}
            aria-pressed={hand === h}
            title={h === 'L' ? 'Mano izquierda (I)' : 'Mano derecha (D)'}
            onClick={() => editActions.hand(h)}
          >
            {h === 'L' ? 'MI' : 'MD'}
          </button>
        ))}
      </div>
      <div className={styles.grupo} role="group" aria-label="Dedo">
        {([1, 2, 3, 4, 5] as const).map((f) => (
          <button
            key={f}
            type="button"
            className={styles.chip}
            aria-pressed={finger === f}
            title={`Dedo ${f} (${f})`}
            onClick={() => editActions.finger(f)}
          >
            {f}
          </button>
        ))}
        <button
          type="button"
          className={styles.chip}
          title="Dedo automático (0)"
          onClick={() => editActions.finger(null)}
        >
          Auto
        </button>
      </div>
      <div className={styles.grupo}>
        <IconButton
          label="Mover antes (←)"
          icon={<ArrowLeft />}
          onClick={() => editActions.move(-STEP)}
        />
        <IconButton
          label="Mover después (→)"
          icon={<ArrowRight />}
          onClick={() => editActions.move(STEP)}
        />
        <IconButton label="Acortar" icon={<Minus />} onClick={() => editActions.resize(-STEP)} />
        <IconButton label="Alargar" icon={<Plus />} onClick={() => editActions.resize(STEP)} />
        <IconButton
          label="Subir un semitono (↑)"
          icon={<ArrowUp />}
          onClick={() => editActions.transpose(1)}
        />
        <IconButton
          label="Bajar un semitono (↓)"
          icon={<ArrowDown />}
          onClick={() => editActions.transpose(-1)}
        />
        <IconButton label="Borrar (Supr)" icon={<Trash2 />} onClick={editActions.remove} />
        <IconButton
          label="Quitar la selección (Esc)"
          icon={<X />}
          onClick={() => useStudio.getState().select([])}
        />
      </div>
    </div>
  );
}
