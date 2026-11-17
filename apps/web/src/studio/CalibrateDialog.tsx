import type { KeyboardCalibration } from '@impromptu/core';
import { Button, Lcd } from '@impromptu/ui';
import { Minus, Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { useStudio } from './store';
import { useCamera } from './camera';
import { useVideo } from './video';
import styles from './CalibrateDialog.module.css';

type Step = 'low' | 'high' | 'line';

const STEPS: Record<Step, string> = {
  low: 'Haz clic en el centro de la primera tecla que se ve (la más grave).',
  high: 'Ahora en el centro de la última tecla que se ve (la más aguda).',
  line: 'Por último, en la línea donde empiezan las teclas: ahí aterrizan las notas.',
};

const NAMES = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
const noteName = (p: number) => `${NAMES[p % 12]}${Math.floor(p / 12) - 1}`;

/**
 * Calibración de teclas sobre el video (ROADMAP fase 3): el usuario marca la primera y la
 * última tecla y la línea de aterrizaje, en coordenadas 0–1 del video (KeyboardCalibration).
 */
export function CalibrateDialog({
  open,
  onClose,
  target = 'video',
}: {
  open: boolean;
  onClose: () => void;
  /** Calibrar sobre el video abierto o sobre la cámara en vivo. */
  target?: 'video' | 'camera';
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imported = useVideo((s) => s.video);
  const camElement = useCamera((s) => (s.active ? s.element : null));
  const camWidth = useCamera((s) => s.width);
  const camHeight = useCamera((s) => s.height);
  const video = useMemo(
    () =>
      target === 'camera'
        ? camElement
          ? { element: camElement, width: camWidth, height: camHeight }
          : null
        : imported,
    [target, camElement, camWidth, camHeight, imported],
  );
  const range = useStudio((s) => s.take?.keyboardRange ?? { low: 36, high: 96 });
  const [step, setStep] = useState<Step>('low');
  const [lowPitch, setLowPitch] = useState(range.low);
  const [highPitch, setHighPitch] = useState(range.high);
  const [points, setPoints] = useState<{
    low?: [number, number];
    high?: [number, number];
    line?: number;
  }>({});

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      setStep('low');
      setPoints({});
      const cal =
        target === 'camera'
          ? useCamera.getState().calibration
          : useVideo.getState().video?.calibration;
      setLowPitch(cal?.lowKey.pitch ?? range.low);
      setHighPitch(cal?.highKey.pitch ?? range.high);
    }
    if (!open && dialog.open) dialog.close();
  }, [open, range.low, range.high, target]);

  // Dibuja el cuadro actual del video con las marcas.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!open || !canvas || !video) return;
    canvas.width = video.width;
    canvas.height = video.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video.element, 0, 0, video.width, video.height);
    const amber = getComputedStyle(document.documentElement).getPropertyValue('--ambar').trim();
    ctx.strokeStyle = amber;
    ctx.fillStyle = amber;
    ctx.lineWidth = Math.max(2, video.width / 400);
    const r = Math.max(6, video.width / 120);
    for (const p of [points.low, points.high]) {
      if (!p) continue;
      ctx.beginPath();
      ctx.arc(p[0] * video.width, p[1] * video.height, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (points.line !== undefined) {
      ctx.fillRect(0, points.line * video.height - ctx.lineWidth / 2, video.width, ctx.lineWidth);
    }
  }, [open, video, points]);

  const onClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    if (step === 'low') {
      setPoints((p) => ({ ...p, low: [x, y] }));
      setStep('high');
    } else if (step === 'high') {
      setPoints((p) => ({ ...p, high: [x, y] }));
      setStep('line');
    } else {
      setPoints((p) => ({ ...p, line: y }));
    }
  };

  const ready = points.low && points.high && points.line !== undefined;
  const save = () => {
    if (!ready) return;
    const calibration: KeyboardCalibration = {
      lowKey: { pitch: lowPitch, x: points.low![0], y: points.low![1] },
      highKey: { pitch: highPitch, x: points.high![0], y: points.high![1] },
      keyLineY: points.line!,
    };
    if (target === 'camera') useCamera.setState({ calibration });
    else useVideo.getState().patch({ calibration });
    useStudio.getState().setSettings({ layout: 'camera-top' });
    onClose();
  };

  return (
    <dialog
      ref={ref}
      className={styles.dialogo}
      aria-labelledby="calibrar-titulo"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <h2 id="calibrar-titulo" className="ui-titulo-panel">
        Calibrar teclas
      </h2>
      <p className={styles.paso} role="status">
        {STEPS[step]}
      </p>
      {video ? (
        <canvas ref={canvasRef} className={styles.cuadro} onClick={onClick} />
      ) : (
        <p className="ui-secundario">Abre primero un video.</p>
      )}
      <div className={styles.teclas}>
        <PitchField label="Primera tecla" value={lowPitch} onChange={setLowPitch} />
        <PitchField label="Última tecla" value={highPitch} onChange={setHighPitch} />
      </div>
      <div className={styles.acciones}>
        <Button
          onClick={() => {
            setPoints({});
            setStep('low');
          }}
        >
          Empezar de nuevo
        </Button>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="primary" disabled={!ready} onClick={save}>
          Guardar calibración
        </Button>
      </div>
    </dialog>
  );
}

function PitchField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className={styles.tecla}>
      <span className="ui-etiqueta">{label}</span>
      <button
        type="button"
        className={styles.paso1}
        aria-label={`${label}: medio tono abajo`}
        onClick={() => onChange(Math.max(21, value - 1))}
      >
        <Minus aria-hidden="true" />
      </button>
      <Lcd size="md">{noteName(value)}</Lcd>
      <button
        type="button"
        className={styles.paso1}
        aria-label={`${label}: medio tono arriba`}
        onClick={() => onChange(Math.min(108, value + 1))}
      >
        <Plus aria-hidden="true" />
      </button>
    </div>
  );
}
