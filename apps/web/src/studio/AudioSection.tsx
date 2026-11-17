import { Button, Slider, Switch } from '@impromptu/ui';
import { AudioLines, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { engine } from './audio';
import { analyzeAudio, audioOffset, syncQuality, useOwnAudio } from './ownAudio';
import { useStudio } from './store';
import styles from './LivePanel.module.css';

const QUALITY_TEXT = {
  good: 'Sincronizado',
  doubtful: 'Sincronía dudosa: revísala de oído y ajústala si hace falta.',
  mismatch:
    'Este audio no parece la misma pieza que el MIDI. Revisa que sean de la misma grabación.',
} as const;

/** Abre un audio y lo sincroniza con el MIDI abierto. Devuelve un mensaje de error o null. */
export async function openOwnAudio(file: File): Promise<string | null> {
  const take = useStudio.getState().take;
  if (!take) return 'Abre primero el MIDI de la pieza; luego su audio.';
  useOwnAudio.setState({ analyzing: true });
  try {
    const notes = take.tracks.flatMap((t) => t.notes);
    useOwnAudio.getState().set(await analyzeAudio(file, engine.audioContext, notes));
    return null;
  } catch {
    return 'No pudimos leer ese audio. Prueba con MP3, WAV, M4A o FLAC.';
  } finally {
    useOwnAudio.setState({ analyzing: false });
  }
}

const fmt = (s: number) => `${s >= 0 ? '+' : '−'}${Math.abs(s).toFixed(2).replace('.', ',')} s`;

/** Sección "Audio": tu MP3 de la misma pieza, sincronizado con el MIDI. */
export function AudioSection() {
  const audio = useOwnAudio((s) => s.audio);
  const analyzing = useOwnAudio((s) => s.analyzing);
  const hasTake = useStudio((s) => s.take !== null);
  const speed = useStudio((s) => s.speed);
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { patch, set } = useOwnAudio.getState();
  const quality = audio ? syncQuality(audio.confidence, audio.agree) : null;

  return (
    <section className={styles.seccion} aria-labelledby="audio-titulo">
      <h3 id="audio-titulo" className="ui-etiqueta">
        Audio
      </h3>
      <input
        ref={input}
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.flac,.ogg"
        className="ui-oculto"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) setError(await openOwnAudio(file));
        }}
      />
      {!audio && (
        <>
          <p className="ui-secundario">
            Abre el MP3 o WAV de la misma pieza (por ejemplo, el que exportas de tu DAW) y se
            sincroniza solo con el MIDI.
          </p>
          <Button
            icon={<AudioLines />}
            disabled={!hasTake || analyzing}
            onClick={() => input.current?.click()}
          >
            {analyzing ? 'Sincronizando' : 'Abrir audio'}
          </Button>
        </>
      )}
      {audio && quality && (
        <>
          <div className={styles.toma}>
            <span className={styles.nombre}>{audio.name}</span>
            <button
              type="button"
              className={styles.quitar}
              aria-label="Quitar el audio"
              onClick={() => set(null)}
            >
              <X aria-hidden="true" />
            </button>
          </div>
          <p className={quality === 'good' ? 'ui-secundario' : styles.alerta} role="status">
            {QUALITY_TEXT[quality]} · desfase {fmt(audioOffset(audio))}
          </p>
          <Slider
            label="Ajustar sincronía"
            min={-500}
            max={500}
            step={5}
            value={Math.round(audio.nudge * 1000)}
            onChange={(ms) => patch({ nudge: ms / 1000 })}
            format={(ms) => `${ms > 0 ? '+' : ''}${ms} ms`}
          />
          <Switch label="Usar mi audio" checked={audio.use} onChange={(use) => patch({ use })} />
          {audio.use && speed !== 1 && (
            <p className="ui-secundario">
              A {String(speed).replace('.', ',')}× suena el piano de la app: tu audio cambiaría de
              tono.
            </p>
          )}
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
