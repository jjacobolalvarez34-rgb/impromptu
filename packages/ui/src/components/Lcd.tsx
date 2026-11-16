import type { HTMLAttributes } from 'react';
import styles from './Lcd.module.css';

export interface LcdProps extends HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg';
}

/** Pantalla LCD para tiempo, tempo y compás (DESIGN §4). */
export function Lcd({ size = 'md', className, children, ...rest }: LcdProps) {
  return (
    <span className={[styles.lcd, styles[size], className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </span>
  );
}
