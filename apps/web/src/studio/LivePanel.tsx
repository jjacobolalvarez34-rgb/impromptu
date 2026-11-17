import { Button, IconButton } from '@impromptu/ui';
import { Cable, Check, Pencil, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { live, refreshTakes, useLive } from './live';
import { useStudio } from './store';
import { deleteTake, loadTake, renameTake } from './takesDb';
import type { TakeSummary } from './takesDb';
import { formatTime } from './transport';
import styles from './LivePanel.module.css';

const STATUS_TEXT: Partial<Record<ReturnType<typeof useLive.getState>['status'], string>> = {
  unsupported:
    'Este navegador no puede leer teclados MIDI. Usa Chrome o Edge en el computador, o Chrome en Android.',
  denied:
    'No diste permiso para leer el teclado. Actívalo en el candado de la barra de direcciones y vuelve a intentar.',
  failed: 'No pudimos acceder al teclado. Revisa el cable USB y vuelve a intentar.',
};

/** Sección "Teclado": permiso explicado, conexión y elección de dispositivo. */
export function KeyboardSection() {
  const status = useLive((s) => s.status);
  const devices = useLive((s) => s.devices);
  const device = useLive((s) => s.device);
  const message = STATUS_TEXT[status];

  return (
    <section className={styles.seccion} aria-labelledby="teclado-titulo">
      <h2 id="teclado-titulo" className="ui-etiqueta">
        Teclado
      </h2>
      {(status === 'off' || status === 'asking') && (
        <>
          <p className="ui-secundario">
            Conecta tu teclado por USB. Impromptu solo lee las notas y los pedales; nada sale de tu
            equipo.
          </p>
          <Button
            icon={<Cable />}
            disabled={status === 'asking'}
            onClick={() => void live.connect()}
          >
            {status === 'asking' ? 'Esperando permiso' : 'Conectar teclado'}
          </Button>
        </>
      )}
      {status === 'ready' && devices.length === 0 && (
        <p className="ui-secundario">
          No encontramos tu teclado. Revisa el cable USB y que esté encendido.
        </p>
      )}
      {status === 'ready' && devices.length > 0 && (
        <ul className={styles.lista} aria-label="Dispositivos">
          {devices.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                className={styles.fila}
                aria-current={device?.id === d.id}
                disabled={!d.connected}
                onClick={() => live.choose(d.id)}
              >
                <span className={styles.punto} data-on={device?.id === d.id} aria-hidden="true" />
                <span className={styles.nombre}>{d.name}</span>
                {d.profile.id !== 'generic' && (
                  <span className="ui-secundario">{d.profile.label}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      {message && (
        <p role="alert" className={styles.alerta}>
          {message}
        </p>
      )}
    </section>
  );
}

/** Sección "Tomas": las grabaciones guardadas en el equipo. */
export function TakesSection() {
  const takes = useLive((s) => s.takes);
  const current = useStudio((s) => s.take?.id);
  useEffect(() => {
    void refreshTakes();
  }, []);

  if (takes.length === 0) return null;
  return (
    <section className={styles.seccion} aria-labelledby="tomas-titulo">
      <h2 id="tomas-titulo" className="ui-etiqueta">
        Tomas
      </h2>
      <ul className={styles.lista}>
        {takes.map((t) => (
          <TakeRow key={t.id} take={t} current={t.id === current} />
        ))}
      </ul>
    </section>
  );
}

function TakeRow({ take, current }: { take: TakeSummary; current: boolean }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(take.title);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!confirmDelete) return;
    const timer = window.setTimeout(() => setConfirmDelete(false), 3000);
    return () => window.clearTimeout(timer);
  }, [confirmDelete]);

  const open = async () => {
    const full = await loadTake(take.id);
    if (full) useStudio.getState().open(full);
  };
  const save = async () => {
    const clean = title.trim() || take.title;
    setEditing(false);
    await renameTake(take.id, clean);
    const opened = useStudio.getState().take;
    if (opened?.id === take.id) useStudio.setState({ take: { ...opened, title: clean } });
    await refreshTakes();
  };
  const remove = async () => {
    await deleteTake(take.id);
    await refreshTakes();
  };

  if (editing) {
    return (
      <li className={styles.toma}>
        <input
          className={styles.campo}
          value={title}
          aria-label="Nombre de la toma"
          autoFocus
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void save();
            if (e.key === 'Escape') {
              setTitle(take.title);
              setEditing(false);
            }
          }}
        />
        <IconButton label="Guardar nombre" icon={<Check />} onClick={() => void save()} />
        <IconButton label="Cancelar" icon={<X />} onClick={() => setEditing(false)} />
      </li>
    );
  }

  return (
    <li className={styles.toma}>
      <button
        type="button"
        className={styles.fila}
        aria-current={current}
        onClick={() => void open()}
      >
        <span className={styles.nombre}>{take.title}</span>
        <span className="ui-secundario ui-mono">{formatTime(take.duration).slice(0, 5)}</span>
      </button>
      <IconButton
        label={`Renombrar ${take.title}`}
        icon={<Pencil />}
        onClick={() => setEditing(true)}
      />
      {confirmDelete ? (
        <Button variant="stop" onClick={() => void remove()}>
          Borrar
        </Button>
      ) : (
        <IconButton
          label={`Borrar ${take.title}`}
          icon={<Trash2 />}
          onClick={() => setConfirmDelete(true)}
        />
      )}
    </li>
  );
}
