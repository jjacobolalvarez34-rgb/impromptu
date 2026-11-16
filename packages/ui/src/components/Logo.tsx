import type { CSSProperties } from 'react';
import styles from './Logo.module.css';

export interface LogoProps {
  /**
   * Tamaño de la palabra: px como número, o una longitud CSS fluida
   * (por ejemplo `clamp(32px, 11vw, 58px)`). El logo de referencia usa 58.
   */
  size?: number | string;
  /** carbon: principal. claro: sobre fondo claro. ambar: una tinta sobre ámbar (solo palabra). */
  variant?: 'carbon' | 'claro' | 'ambar';
  /**
   * Muestra el teclado bajo la palabra. Por defecto, solo si el logo mide al menos
   * 120 px de ancho (DESIGN §1), es decir, desde size ≈ 24.
   */
  keyboard?: boolean;
}

const KEYS = 10;

/**
 * Logo hecho con texto y CSS, nítido a cualquier tamaño (DESIGN §1).
 * El punto de la "i" es una nota ámbar cayendo sobre una "ı" sin punto.
 */
export function Logo({ size = 58, variant = 'carbon', keyboard }: LogoProps) {
  // Con un tamaño fluido no se puede medir aquí: quien lo usa garantiza el mínimo de 120 px.
  const bigEnough = typeof size === 'number' ? size >= 24 : true;
  const withKeyboard = variant !== 'ambar' && (keyboard ?? bigEnough);
  return (
    <span
      role="img"
      aria-label="impromptu"
      className={styles.logo}
      data-variante={variant}
      style={{ '--logo-size': typeof size === 'number' ? `${size}px` : size } as CSSProperties}
    >
      <span className={styles.palabra} aria-hidden="true">
        <span className={styles.i}>
          ı<span className={styles.nota} />
        </span>
        mpromptu
      </span>
      {withKeyboard && (
        <span className={styles.teclado} aria-hidden="true">
          {Array.from({ length: KEYS }, (_, i) => (
            <span key={i} className={styles.tecla} data-encendida={i === 0} />
          ))}
        </span>
      )}
    </span>
  );
}
