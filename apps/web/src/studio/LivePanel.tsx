import { exportMidi } from '@impromptu/midi';
import { Button, Chips, IconButton, Switch } from '@impromptu/ui';
import { Cable, Check, FileAudio, Mic, Pencil, Piano, Trash2, Video, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { live, refreshTakes, useLive } from './live';
import { useStudio } from './store';
import { InsigniaInstrumento, textoConectar } from './Instrumento';
import { loadMedia } from './mediaStore';
import { useMetronome } from './metronome';
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

/** Teclado: permiso explicado, conexión y elección de dispositivo (bloque "Grabar"). */
export function KeyboardSection() {
  const status = useLive((s) => s.status);
  const devices = useLive((s) => s.devices);
  const device = useLive((s) => s.device);
  const recordMic = useLive((s) => s.recordMic);
  const setRecordMic = useLive((s) => s.setRecordMic);
  const message = STATUS_TEXT[status];
  const instrumento = useStudio((s) => s.instrumento);
  useEffect(() => {
    void live.autoConnect();
  }, []);

  return (
    <div className={styles.seccion}>
      {(status === 'off' || status === 'asking') && (
        <>
          <p className="ui-secundario">
            {instrumento === 'drums'
              ? 'Conecta tu batería electrónica por USB.'
              : instrumento === 'piano'
                ? 'Conecta tu teclado por USB.'
                : 'Conecta tu guitarra MIDI (o un teclado) por USB.'}{' '}
            Impromptu solo lee las notas; nada sale de tu equipo.
          </p>
          <Button
            icon={<Cable />}
            disabled={status === 'asking'}
            onClick={() => void live.connect()}
          >
            {status === 'asking' ? 'Esperando permiso' : textoConectar(instrumento)}
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
      {device && (
        <>
          <Switch
            label="Grabar también el sonido (micrófono)"
            checked={recordMic}
            onChange={setRecordMic}
          />
          <MetronomeControls />
        </>
      )}
      {message && (
        <p role="alert" className={styles.alerta}>
          {message}
        </p>
      )}
    </div>
  );
}

/**
 * Solo en el localhost: guarda el MIDI y el audio de una toma del teclado en
 * fixtures/jacobo/pares/, para medir los modelos de audio a notas contra lo que se tocó.
 */
async function saveForTests(id: string): Promise<string> {
  const take = await loadTake(id);
  const ref = take?.media.find((m) => m.kind === 'audio');
  const audio = ref ? await loadMedia(ref.storageKey) : null;
  if (!take || !ref || !audio) return 'Esta toma no tiene audio.';
  const name = take.title.replace(/[^\p{L}\p{N} _-]+/gu, '').trim() || take.id;
  const ext = ref.storageKey.split('.').pop() ?? 'webm';
  const post = (file: string, body: BodyInit) =>
    fetch(`${import.meta.env.BASE_URL}dev/guardar-par?archivo=${encodeURIComponent(file)}`, {
      method: 'POST',
      body,
    });
  const meta = JSON.stringify({ titulo: take.title, desfaseAudio: ref.offset }, null, 2);
  const results = await Promise.all([
    post(`${name}.mid`, new Blob([exportMidi(take) as BlobPart])),
    post(`${name}.${ext}`, audio),
    post(`${name}.json`, meta),
  ]);
  return results.every((r) => r.ok)
    ? `Guardada en fixtures/jacobo/pares/${name}`
    : 'No se pudo guardar.';
}

/** Cuántas grabaciones se ven antes de "Ver todas". */
const VISIBLE = 6;

const SOURCE_ICON = {
  teclado: <Piano aria-hidden="true" />,
  microfono: <Mic aria-hidden="true" />,
  archivo: <FileAudio aria-hidden="true" />,
} as const;

const SOURCE_TEXT = { teclado: 'teclado', microfono: 'micrófono', archivo: 'archivo de audio' };

/** "Tus grabaciones": todo lo grabado o convertido, guardado en el equipo, lo más nuevo arriba. */
export function TakesSection() {
  const takes = useLive((s) => s.takes);
  const current = useStudio((s) => s.take?.id);
  const [all, setAll] = useState(false);
  useEffect(() => {
    void refreshTakes();
  }, []);

  const shown = all ? takes : takes.slice(0, VISIBLE);
  return (
    <section className={styles.seccion} aria-labelledby="grabaciones-titulo">
      <h2 id="grabaciones-titulo" className="ui-etiqueta">
        Tus grabaciones
      </h2>
      {takes.length === 0 ? (
        <p className="ui-secundario">
          Lo que grabes con el teclado o el micrófono, o conviertas desde un audio, queda aquí,
          guardado en tu equipo.
        </p>
      ) : (
        <ul className={styles.lista}>
          {shown.map((t) => (
            <TakeRow key={t.id} take={t} current={t.id === current} />
          ))}
        </ul>
      )}
      {takes.length > VISIBLE && (
        <button type="button" className={styles.mas} onClick={() => setAll(!all)}>
          {all ? 'Ver menos' : `Ver todas (${takes.length})`}
        </button>
      )}
    </section>
  );
}

function TakeRow({ take, current }: { take: TakeSummary; current: boolean }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(take.title);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

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
        <span className={styles.origen}>{SOURCE_ICON[take.source]}</span>
        <span className={styles.nombre}>
          {take.title}
          <span className="ui-oculto">, desde el {SOURCE_TEXT[take.source]}</span>
        </span>
        {take.video && <Video className={styles.extra} aria-label="con video" />}
        <InsigniaInstrumento instrumento={take.instrumento ?? 'piano'} />
        <span className="ui-secundario ui-mono">{formatTime(take.duration).slice(0, 5)}</span>
      </button>
      {/* Renombrar y borrar solo en la grabación abierta: así el nombre de cada fila se lee completo. */}
      {current && (
        <div className={styles.acciones}>
          {import.meta.env.DEV && take.source === 'teclado' && take.audio && (
            <Button onClick={() => void saveForTests(take.id).then(setSaved)}>
              Guardar para pruebas
            </Button>
          )}
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
        </div>
      )}
      {saved && (
        <p className="ui-secundario" role="status">
          {saved}
        </p>
      )}
    </li>
  );
}

const METER_OPTIONS = [
  { value: '2', label: '2/4' },
  { value: '3', label: '3/4' },
  { value: '4', label: '4/4' },
] as const;

/** Metrónomo al grabar: con él, la partitura sale con el tempo y el compás exactos. */
function MetronomeControls() {
  const { on, bpm, beats, set } = useMetronome();
  return (
    <>
      <Switch label="Metrónomo al grabar" checked={on} onChange={(v) => set({ on: v })} />
      {on && (
        <>
          <label className={styles.metronomo}>
            <input
              type="number"
              min={30}
              max={240}
              value={bpm}
              aria-label="Tempo del metrónomo (negras por minuto)"
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v >= 30 && v <= 240) set({ bpm: v });
              }}
            />
            <span className="ui-secundario">BPM</span>
          </label>
          <Chips
            label="Compás del metrónomo"
            options={METER_OPTIONS}
            value={String(beats) as '2' | '3' | '4'}
            onChange={(v) => set({ beats: Number(v) })}
          />
          <p className="ui-secundario">
            El primer compás es de cuenta. Con metrónomo, la partitura sale con el ritmo exacto.
          </p>
        </>
      )}
    </>
  );
}
