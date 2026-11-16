import { useRef } from 'react';
import { focusItem, rovingIndex } from './roving';
import styles from './Tabs.module.css';

export interface TabItem<T extends string> {
  id: T;
  label: string;
}

export interface TabsProps<T extends string> {
  label: string;
  tabs: readonly TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  /** Prefijo de id para enlazar cada pestaña con su panel (`${idPrefix}-panel-${id}`). */
  idPrefix: string;
}

/** Pestañas (DESIGN §4): la activa en --chasis con subrayado ámbar de 2 px. */
export function Tabs<T extends string>({ label, tabs, value, onChange, idPrefix }: TabsProps<T>) {
  const ref = useRef<HTMLDivElement>(null);
  const selected = Math.max(
    0,
    tabs.findIndex((t) => t.id === value),
  );

  return (
    <div
      ref={ref}
      role="tablist"
      aria-label={label}
      className={styles.lista}
      onKeyDown={(e) => {
        const next = rovingIndex(e, selected, tabs.length);
        const tab = next === null ? undefined : tabs[next];
        if (next === null || !tab) return;
        e.preventDefault();
        onChange(tab.id);
        focusItem(ref.current, '[role="tab"]', next);
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          id={`${idPrefix}-tab-${t.id}`}
          type="button"
          role="tab"
          aria-selected={t.id === value}
          aria-controls={`${idPrefix}-panel-${t.id}`}
          tabIndex={t.id === value ? 0 : -1}
          className={styles.pestana}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
