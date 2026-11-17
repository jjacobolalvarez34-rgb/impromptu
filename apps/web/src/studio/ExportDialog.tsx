import { ExportFailure, exportVideo, fileName, frameSize } from '@impromptu/export';
import type { FrameRate, Resolution } from '@impromptu/export';
import { Button, Chips, Lcd, Switch } from '@impromptu/ui';
import { Download } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { engine, useAudio } from './audio';
import { useStudio } from './store';
import type { Aspect } from './store';
import styles from './ExportDialog.module.css';

const ASPECTS = [
  { value: '16:9', label: 'Horizontal 16:9' },
  { value: '9:16', label: 'Vertical 9:16' },
  { value: '1:1', label: 'Cuadrado 1:1' },
] as const;
const RESOLUTIONS = [
  { value: '1080p', label: '1080p' },
  { value: '4k', label: '4K' },
] as const;
const RATES = [
  { value: '30', label: '30 fps' },
  { value: '60', label: '60 fps' },
] as const;

type State =
  | { step: 'form' }
  | { step: 'working'; phase: string; value: number }
  | { step: 'done'; url: string; name: string; size: string }
  | { step: 'error'; message: string };

const PHASES: Record<string, string> = {
  audio: 'Preparando el audio',
  video: 'Dibujando cuadros',
  final: 'Cerrando el archivo',
};

/** Ventana "Exportar video": formato, resolución, fps y audio; progreso y cancelar. */
export function ExportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const take = useStudio((s) => s.take);
  const aspect = useStudio((s) => s.aspect);
  const audioStatus = useAudio((s) => s.status);
  const audioProgress = useAudio((s) => s.progress);
  const [resolution, setResolution] = useState<Resolution>('1080p');
  const [fps, setFps] = useState<FrameRate>(60);
  const [withPiano, setWithPiano] = useState(true);
  const [state, setState] = useState<State>({ step: 'form' });
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Libera el archivo anterior al cerrar o al exportar otro.
  useEffect(() => {
    if (state.step !== 'done') return;
    const url = state.url;
    return () => URL.revokeObjectURL(url);
  }, [state]);

  const close = () => {
    if (state.step === 'working') cancel();
    else setState({ step: 'form' });
    onClose();
  };

  /** Cancelar responde al instante: la ventana vuelve al formulario sin esperar al render. */
  const cancel = () => {
    abort.current?.abort();
    abort.current = null;
    useStudio.setState({ exporting: false });
    setState({ step: 'form' });
  };

  const start = async () => {
    if (!take) return;
    const controller = new AbortController();
    abort.current = controller;
    setState({ step: 'working', phase: 'Descargando el piano', value: 0 });
    // Si el piano aún se está descargando, se espera (con su avance en la barra).
    const piano = withPiano ? await engine.preload() : null;
    if (controller.signal.aborted) return;
    useStudio.setState({ exporting: true });
    try {
      const { settings } = useStudio.getState();
      const result = await exportVideo({
        take,
        settings,
        aspect,
        resolution,
        fps,
        piano,
        signal: controller.signal,
        onProgress: ({ phase, value }) =>
          setState({ step: 'working', phase: PHASES[phase] ?? '', value }),
      });
      setState({
        step: 'done',
        url: URL.createObjectURL(result.blob),
        name: fileName(take.title, result.extension),
        size: `${(result.blob.size / 1_048_576).toFixed(1)} MB`,
      });
    } catch (e) {
      if (controller.signal.aborted)
        return; // ya se volvió al formulario al cancelar
      else if (e instanceof ExportFailure && e.reason === 'unsupported')
        setState({
          step: 'error',
          message:
            'Este navegador no puede crear videos. Usa Chrome o Edge actualizados en el computador.',
        });
      else
        setState({
          step: 'error',
          message: 'No pudimos terminar el video. Prueba con 1080p o 30 fps y vuelve a intentar.',
        });
    } finally {
      if (abort.current === controller) {
        useStudio.setState({ exporting: false });
        abort.current = null;
      }
    }
  };

  const size = frameSize(aspect, resolution);

  return (
    <dialog
      ref={ref}
      className={styles.dialogo}
      aria-labelledby="exportar-titulo"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <h2 id="exportar-titulo" className="ui-titulo-panel">
        Exportar video
      </h2>
      <p className="ui-secundario">{take?.title ?? 'Abre una pieza o una toma primero.'}</p>

      {state.step === 'form' && (
        <div className={styles.campos}>
          <span className="ui-etiqueta">Formato</span>
          <Chips
            label="Formato"
            options={ASPECTS}
            value={aspect}
            onChange={(v) => useStudio.getState().setAspect(v as Aspect)}
          />
          <span className="ui-etiqueta">Resolución</span>
          <Chips
            label="Resolución"
            options={RESOLUTIONS}
            value={resolution}
            onChange={setResolution}
          />
          <span className="ui-etiqueta">Cuadros por segundo</span>
          <Chips
            label="Cuadros por segundo"
            options={RATES}
            value={String(fps) as '30' | '60'}
            onChange={(v) => setFps(Number(v) as FrameRate)}
          />
          <Switch label="Incluir el piano de la app" checked={withPiano} onChange={setWithPiano} />
          <p className="ui-secundario ui-mono">
            {size.width} × {size.height} · {fps} fps
          </p>
          <div className={styles.acciones}>
            <Button onClick={close}>Cerrar</Button>
            <Button variant="primary" disabled={!take} onClick={() => void start()}>
              Exportar
            </Button>
          </div>
        </div>
      )}

      {state.step === 'working' &&
        state.phase === 'Descargando el piano' &&
        audioStatus === 'loading' && (
          <p className="ui-secundario">
            Piano: {Math.round(audioProgress * 100)} % (solo la primera vez)
          </p>
        )}
      {state.step === 'working' && (
        <div className={styles.campos} aria-live="polite">
          <span className="ui-etiqueta">{state.phase}</span>
          <div
            className={styles.barra}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(state.value * 100)}
          >
            <span style={{ width: `${state.value * 100}%` }} />
          </div>
          <Lcd size="md">{Math.round(state.value * 100)} %</Lcd>
          <div className={styles.acciones}>
            <Button onClick={cancel}>Cancelar</Button>
          </div>
        </div>
      )}

      {state.step === 'done' && (
        <div className={styles.campos}>
          <p>
            Listo: <strong>{state.name}</strong> ({state.size}).
          </p>
          <div className={styles.acciones}>
            <Button onClick={() => setState({ step: 'form' })}>Exportar otro</Button>
            <a className={styles.descargar} href={state.url} download={state.name}>
              <Download aria-hidden="true" /> Descargar video
            </a>
          </div>
        </div>
      )}

      {state.step === 'error' && (
        <div className={styles.campos}>
          <p role="alert">{state.message}</p>
          <div className={styles.acciones}>
            <Button onClick={() => setState({ step: 'form' })}>Volver</Button>
          </div>
        </div>
      )}
    </dialog>
  );
}
