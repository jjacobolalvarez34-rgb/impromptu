import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * primary: tecla clara. Solo UNO por vista (DESIGN §4).
   * secondary: tecla oscura.
   * stop: detener grabación (fondo --grabacion, texto blanco).
   */
  variant?: 'primary' | 'secondary' | 'stop';
  /** Punto --punto-rec del botón Grabar. */
  rec?: boolean;
  /** Ícono Lucide a la izquierda del texto. */
  icon?: ReactNode;
}

export function Button({
  variant = 'secondary',
  rec = false,
  icon,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[styles.boton, styles[variant], className].filter(Boolean).join(' ')}
      {...rest}
    >
      {rec && <span className={styles.rec} aria-hidden="true" />}
      {icon && (
        <span className={styles.icono} aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Nombre accesible obligatorio: el botón solo muestra un ícono. */
  label: string;
  icon: ReactNode;
}

export function IconButton({ label, icon, className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={[styles.boton, styles.secondary, styles.soloIcono, className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      <span className={styles.icono} aria-hidden="true">
        {icon}
      </span>
    </button>
  );
}
