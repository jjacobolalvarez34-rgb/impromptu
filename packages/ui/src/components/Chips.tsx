import { useRef } from 'react';
import { focusItem, rovingIndex } from './roving';
import styles from './Chips.module.css';

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

export interface ChipsProps<T extends string> {
  /** Nombre accesible del grupo, por ejemplo "Formato". */
  label: string;
  options: readonly ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Selector de opciones (DESIGN §4). Se comporta como un grupo de radio. */
export function Chips<T extends string>({ label, options, value, onChange }: ChipsProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const selected = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={label}
      className={styles.grupo}
      onKeyDown={(e) => {
        const next = rovingIndex(e, selected, options.length);
        const option = next === null ? undefined : options[next];
        if (next === null || !option) return;
        e.preventDefault();
        onChange(option.value);
        focusItem(ref.current, '[role="radio"]', next);
      }}
    >
      {options.map((o, i) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          tabIndex={i === selected ? 0 : -1}
          className={styles.chip}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
