import { useId } from 'react';
import styles from './Switch.module.css';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Texto visible a la izquierda; también es el nombre accesible. */
  label: string;
  disabled?: boolean;
}

/** Interruptor cuadrado (DESIGN §4): encendido = pista ámbar y perilla carbón. */
export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  const id = useId();
  return (
    <div className={styles.fila}>
      <label htmlFor={id} className={styles.etiqueta}>
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={styles.interruptor}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.perilla} aria-hidden="true" />
      </button>
    </div>
  );
}
