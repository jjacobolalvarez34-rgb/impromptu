import { useId } from 'react';
import type { CSSProperties } from 'react';
import styles from './Slider.module.css';

export interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Texto del valor a la derecha, en mono. Por defecto, el número tal cual. */
  format?: (value: number) => string;
  disabled?: boolean;
}

/** Deslizador (DESIGN §4): pista --linea, recorrido y perilla ámbar. */
export function Slider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  format = String,
  disabled,
}: SliderProps) {
  const id = useId();
  const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;
  const text = format(value);

  return (
    <div className={styles.campo}>
      <div className={styles.cabecera}>
        <label htmlFor={id} className={styles.etiqueta}>
          {label}
        </label>
        <output htmlFor={id} className={styles.valor}>
          {text}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        aria-valuetext={text}
        className={styles.rango}
        style={{ '--recorrido': `${percent}%` } as CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
