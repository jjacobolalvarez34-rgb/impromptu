import { Button, Logo } from '@impromptu/ui';
import { FileAudio, FileMusic } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useLive } from './live';
import { useStudio } from './store';
import { loadTake } from './takesDb';
import { formatTime } from './transport';
import styles from './Welcome.module.css';

/**
 * Bienvenida de la app de escritorio (DESIGN §5, "Estudio directo"): qué quieres hacer y lo
 * abierto hace poco. Se cierra al elegir algo, con Esc o con Empezar.
 */
export function Welcome({
  onClose,
  onOpenMidi,
  onConvertAudio,
}: {
  onClose: () => void;
  onOpenMidi: () => void;
  onConvertAudio: () => void;
}) {
  const takes = useLive((s) => s.takes).slice(0, 5);
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    first.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);

  const open = async (id: string) => {
    const take = await loadTake(id);
    if (take) useStudio.getState().open(take);
    onClose();
  };

  return (
    <div className={styles.fondo}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bienvenida-titulo"
        className={styles.caja}
      >
        <Logo size={34} keyboard={false} />
        <h2 id="bienvenida-titulo" className={styles.pregunta}>
          ¿Qué quieres hacer?
        </h2>
        <div className={styles.acciones}>
          <Button ref={first} variant="primary" rec onClick={onClose}>
            Grabar
          </Button>
          <Button
            icon={<FileMusic />}
            onClick={() => {
              onClose();
              onOpenMidi();
            }}
          >
            Abrir MIDI
          </Button>
          <Button
            icon={<FileAudio />}
            onClick={() => {
              onClose();
              onConvertAudio();
            }}
          >
            De MP3 a MIDI
          </Button>
        </div>
        {takes.length > 0 && (
          <>
            <p className="ui-etiqueta">Abiertos hace poco</p>
            <ul className={styles.lista}>
              {takes.map((t) => (
                <li key={t.id}>
                  <button type="button" className={styles.fila} onClick={() => void open(t.id)}>
                    <span>{t.title}</span>
                    <span className="ui-mono ui-secundario">
                      {formatTime(t.duration).slice(0, 5)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
        <button type="button" className={styles.cerrar} onClick={onClose}>
          Ir al estudio
        </button>
      </div>
    </div>
  );
}
