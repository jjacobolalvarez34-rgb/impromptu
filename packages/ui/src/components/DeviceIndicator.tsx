import styles from './DeviceIndicator.module.css';

export interface DeviceIndicatorProps {
  name: string;
  connected: boolean;
}

/** Indicador de dispositivo (DESIGN §4): punto ámbar si está conectado y gris si no. */
export function DeviceIndicator({ name, connected }: DeviceIndicatorProps) {
  return (
    <span className={styles.indicador} data-conectado={connected}>
      <span className={styles.punto} aria-hidden="true" />
      <span>{name}</span>
      <span className="ui-oculto">{connected ? ', conectado' : ', sin conectar'}</span>
    </span>
  );
}
