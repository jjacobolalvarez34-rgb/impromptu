import { Button, Slider } from '@impromptu/ui';
import { Crosshair, Video, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { engine } from './audio';
import { CalibrateDialog } from './CalibrateDialog';
import { syncQuality } from './ownAudio';
import { useStudio } from './store';
import { openVideo, useVideo, videoOffset } from './video';
import styles from './LivePanel.module.css';

/** Abre un video de las manos y lo sincroniza con el MIDI abierto. Devuelve un error o null. */
export async function openCameraVideo(file: File): Promise<string | null> {
  const take = useStudio.getState().take;
  if (!take) return 'Abre primero el MIDI de la pieza; luego el video.';
  useVideo.setState({ loading: true });
  try {
    const notes = take.tracks.flatMap((t) => t.notes);
    useVideo.getState().set(await openVideo(file, engine.audioContext, notes));
    // Mostrarlo de una vez: en recuadro si estaba solo el visualizador.
    const { settings, setSettings } = useStudio.getState();
    if (settings.layout === 'visualizer') setSettings({ layout: 'camera-inset' });
    return null;
  } catch {
    return 'No pudimos abrir ese video. Prueba con MP4 o WebM.';
  } finally {
    useVideo.setState({ loading: false });
  }
}

const fmt = (s: number) => `${s >= 0 ? '+' : '−'}${Math.abs(s).toFixed(2).replace('.', ',')} s`;

/** Sección "Video": la cámara de tus manos, sincronizada con el MIDI. */
export function VideoSection() {
  const video = useVideo((s) => s.video);
  const loading = useVideo((s) => s.loading);
  const hasTake = useStudio((s) => s.take !== null);
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [calibrating, setCalibrating] = useState(false);
  const { patch, set } = useVideo.getState();

  const status = !video
    ? null
    : video.confidence === null
      ? 'El video no tiene sonido: ajusta la sincronía a mano.'
      : syncQuality(video.confidence, video.agree) === 'good'
        ? 'Sincronizado por el sonido del video'
        : 'Sincronía dudosa: revísala y ajústala si hace falta.';

  return (
    <section className={styles.seccion} aria-labelledby="video-titulo">
      <h2 id="video-titulo" className="ui-etiqueta">
        Video
      </h2>
      <input
        ref={input}
        type="file"
        accept="video/*,.mp4,.webm,.mov"
        className="ui-oculto"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) setError(await openCameraVideo(file));
        }}
      />
      {!video && (
        <>
          <p className="ui-secundario">
            Abre el video de tus manos (del celular o la cámara). Si tiene sonido, se sincroniza
            solo con el MIDI.
          </p>
          <Button
            icon={<Video />}
            disabled={!hasTake || loading}
            onClick={() => input.current?.click()}
          >
            {loading ? 'Abriendo video' : 'Abrir video'}
          </Button>
        </>
      )}
      {video && (
        <>
          <div className={styles.toma}>
            <span className={styles.nombre}>{video.name}</span>
            <button
              type="button"
              className={styles.quitar}
              aria-label="Quitar el video"
              onClick={() => set(null)}
            >
              <X aria-hidden="true" />
            </button>
          </div>
          <p className="ui-secundario" role="status">
            {status} · desfase {fmt(videoOffset(video))}
          </p>
          <Button icon={<Crosshair />} onClick={() => setCalibrating(true)}>
            {video.calibration ? 'Calibrar de nuevo' : 'Calibrar teclas'}
          </Button>
          <CalibrateDialog open={calibrating} onClose={() => setCalibrating(false)} />
          <Slider
            label="Ajustar sincronía"
            min={-2000}
            max={2000}
            step={10}
            value={Math.round(video.nudge * 1000)}
            onChange={(ms) => patch({ nudge: ms / 1000 })}
            format={(ms) => `${ms > 0 ? '+' : ''}${ms} ms`}
          />
        </>
      )}
      {error && (
        <p role="alert" className={styles.alerta}>
          {error}
        </p>
      )}
    </section>
  );
}
