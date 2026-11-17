import { exportMidi } from '@impromptu/midi';
import { beatsOf, buildScore, quantizedTake, toMusicXml } from '@impromptu/notation';
import type { Score } from '@impromptu/notation';
import { Button, Chips } from '@impromptu/ui';
import { Download, FileMusic, Printer } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { midiFileName } from '../studio/saveMidi';
import { transport, useStudio } from '../studio/store';
import styles from './ScoreTab.module.css';

const METERS = [
  { value: '4/4', label: '4/4' },
  { value: '3/4', label: '3/4' },
  { value: '2/4', label: '2/4' },
  { value: '6/8', label: '6/8' },
] as const;
type Meter = (typeof METERS)[number]['value'];

const SOURCE_TEXT = {
  'tempo-map': 'del archivo',
  estimated: 'detectado',
  manual: 'puesto a mano',
} as const;

/** Descarga un archivo generado (MusicXML o MIDI). */
function download(name: string, data: BlobPart, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/**
 * Pestaña Partitura (fase 6): la pieza abierta escrita en dos pentagramas, con el cursor
 * siguiendo la reproducción. El tempo y el compás se pueden corregir; se exporta MusicXML,
 * MIDI cuantizado y PDF (imprimir).
 */
export function ScoreTab({ compact = false }: { compact?: boolean }) {
  const take = useStudio((s) => s.take);
  const [meter, setMeter] = useState<Meter>(
    (take?.timeSignature ? `${take.timeSignature[0]}/${take.timeSignature[1]}` : '4/4') as Meter,
  );
  const [manualBpm, setManualBpm] = useState<number | null>(null);
  const holder = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const beats = useMemo(() => {
    if (!take) return null;
    if (manualBpm === null) return beatsOf(take);
    const first = Math.min(...take.tracks.flatMap((t) => t.notes.map((n) => n.start)), 0);
    return beatsOf(take, { bpm: manualBpm, first: Math.max(0, first) });
  }, [take, manualBpm]);

  const score: Score | null = useMemo(() => {
    if (!take || !beats) return null;
    const [n, d] = meter.split('/').map(Number) as [number, number];
    return buildScore(take, { beats, timeSignature: [n, d] });
  }, [take, beats, meter]);

  const xml = useMemo(() => (score ? toMusicXml(score) : null), [score]);

  // Dibujo con OpenSheetMusicDisplay (se carga solo al abrir esta pestaña).
  const osmd = useRef<OpenSheetMusicDisplay | null>(null);
  useEffect(() => {
    if (!xml || !holder.current) return;
    let cancelled = false;
    const el = holder.current;
    void (async () => {
      try {
        setStatus('loading');
        const { OpenSheetMusicDisplay } = await import('opensheetmusicdisplay');
        if (cancelled) return;
        el.innerHTML = '';
        const view = new OpenSheetMusicDisplay(el, {
          autoResize: true,
          backend: 'svg',
          drawTitle: true,
          drawPartNames: false,
          followCursor: true,
        });
        await view.load(xml);
        if (cancelled) return;
        view.render();
        view.cursor.show();
        osmd.current = view;
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
      osmd.current = null;
    };
  }, [xml]);

  // Cursor sincronizado con la reproducción.
  useEffect(() => {
    if (!score || !beats || status !== 'ready') return;
    const measureQuarters = score.time[0] * (4 / score.time[1]);
    let raf = 0;
    let lastTarget = -1;
    const loop = () => {
      const view = osmd.current;
      if (view) {
        const t = transport.now();
        // Posición en redondas (unidad del cursor de OSMD) desde el comienzo.
        let m = 0;
        while (m + 1 < score.measureTimes.length && score.measureTimes[m + 1]! <= t) m++;
        const start = score.measureTimes[m]!;
        const end = score.measureTimes[m + 1] ?? start + (60 / score.bpm) * measureQuarters;
        const frac = Math.min(0.999, Math.max(0, (t - start) / Math.max(1e-6, end - start)));
        const target = ((m + frac) * measureQuarters) / 4;
        if (Math.abs(target - lastTarget) > 1e-4) {
          const cursor = view.cursor;
          const now = () => cursor.Iterator.currentTimeStamp.RealValue;
          if (now() > target + 1e-6) cursor.reset();
          while (!cursor.Iterator.EndReached) {
            cursor.next();
            if (now() > target + 1e-6) {
              cursor.previous();
              break;
            }
          }
          lastTarget = target;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [score, beats, status]);

  if (!take || !score || !beats) {
    return (
      <div className={styles.vacio}>
        <p>Abre una pieza en el Estudio (un MIDI, una grabación o un audio) para verla escrita.</p>
      </div>
    );
  }

  const base = take.title || 'impromptu';
  return (
    <div className={styles.cuerpo} data-compact={compact}>
      <aside className={styles.panel} aria-label="Ajustes de la partitura" hidden={compact}>
        <h2 className="ui-etiqueta">Tempo</h2>
        <label className={styles.campo}>
          <input
            type="number"
            min={30}
            max={260}
            value={manualBpm ?? Math.round(beats.bpm)}
            aria-label="Tempo en negras por minuto"
            onChange={(e) => {
              const v = Number(e.target.value);
              if (v >= 30 && v <= 260) setManualBpm(v);
            }}
          />
          <span className="ui-secundario">BPM · {SOURCE_TEXT[beats.source]}</span>
        </label>
        {manualBpm !== null && (
          <button type="button" className={styles.enlace} onClick={() => setManualBpm(null)}>
            Volver al tempo detectado
          </button>
        )}
        <p className="ui-secundario">
          Si la partitura sale con figuras raras, prueba el doble o la mitad del tempo.
        </p>

        <h2 className="ui-etiqueta">Compás</h2>
        <Chips label="Compás" options={METERS} value={meter} onChange={setMeter} />

        <h2 className="ui-etiqueta">Exportar</h2>
        <Button
          icon={<Download />}
          onClick={() =>
            xml && download(`${base}.musicxml`, xml, 'application/vnd.recordare.musicxml+xml')
          }
        >
          MusicXML
        </Button>
        <Button
          icon={<FileMusic />}
          onClick={() =>
            download(
              midiFileName(`${base} (cuantizado)`),
              exportMidi(quantizedTake(score)) as BlobPart,
              'audio/midi',
            )
          }
        >
          MIDI cuantizado
        </Button>
        <Button icon={<Printer />} onClick={() => window.print()}>
          Imprimir o guardar PDF
        </Button>
        <p className="ui-secundario">
          MusicXML se abre en MuseScore, Sibelius, Finale o Dorico. Para el PDF, elige «Guardar como
          PDF» en la ventana de impresión.
        </p>
      </aside>
      <main className={styles.hoja} aria-label={`Partitura de ${take.title}`}>
        {status === 'loading' && (
          <p className="ui-secundario" role="status">
            Escribiendo la partitura…
          </p>
        )}
        {status === 'error' && (
          <p role="alert" className="ui-secundario">
            No pudimos dibujar la partitura. Puedes exportar el MusicXML y abrirlo en MuseScore.
          </p>
        )}
        <div ref={holder} className={styles.papel} />
      </main>
    </div>
  );
}
