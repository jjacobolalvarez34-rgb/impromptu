import { exportMidi } from '@impromptu/midi';
import {
  LineaDeLectura,
  aRedondas,
  beatsOf,
  buildScore,
  leerRecorrido,
  BarraEdicion,
  editar,
  hacerSeleccionable,
  marcarSeleccion,
  quantizedTake,
  toMusicXml,
} from '@impromptu/notation';
import type { Edicion, Score, Seleccion } from '@impromptu/notation';
import { Button, Chips } from '@impromptu/ui';
import { Download, FileMusic, Printer } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { AFINACIONES, createTake, createTrack } from '@impromptu/core';
import type { Instrument } from '@impromptu/core';
import { instrumentoDe } from '@impromptu/render';
import { midiFileName } from '../studio/saveMidi';
import { transport, useStudio } from '../studio/store';
import styles from './ScoreTab.module.css';

const VISTAS_TAB = [
  { value: 'ambas', label: 'Notas y tablatura' },
  { value: 'tab', label: 'Solo tablatura' },
] as const;

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
  const abierta = useStudio((s) => s.take);
  const elegido = useStudio((s) => s.instrumento);
  // Sin pieza: la hoja vacía del instrumento elegido (pedido de Jacobo), con unos compases.
  const vacia = useMemo(
    () =>
      abierta
        ? null
        : createTake({
            title: '',
            tracks: [createTrack({ instrument: elegido, name: 'Vacía' })],
            tempoMap: [{ time: 0, bpm: 100 }],
          }),
    [abierta, elegido],
  );
  const take = abierta ?? vacia;
  const instrumento = take ? instrumentoDe(take) : elegido;
  const cuerdas = instrumento === 'guitar' || instrumento === 'bass';
  const [soloTab, setSoloTab] = useState(false);
  const [meter, setMeter] = useState<Meter>(
    (take?.timeSignature ? `${take.timeSignature[0]}/${take.timeSignature[1]}` : '4/4') as Meter,
  );
  const [manualBpm, setManualBpm] = useState<number | null>(null);
  const holder = useRef<HTMLDivElement>(null);
  const hoja = useRef<HTMLElement>(null);

  // Editor (fase 10): tocar una nota de la hoja la elige; la barra de abajo la cambia.
  const [seleccion, setSeleccion] = useState<Seleccion | null>(null);
  const estado = useRef({
    seleccion,
    score: null as Score | null,
    instrumento: 'piano' as Instrument,
  });
  const barra = useRef<BarraEdicion | null>(null);
  const quitarClics = useRef<(() => void) | null>(null);
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
    return buildScore(take, {
      beats,
      timeSignature: [n, d],
      instrument: instrumento,
      compasesMinimos: abierta ? 1 : 4,
    });
  }, [take, beats, meter, instrumento, abierta]);

  const xml = useMemo(
    () =>
      score && take
        ? toMusicXml(score, {
            instrument: instrumento,
            // La afinación elegida es de la guitarra; el bajo usa la suya (4 cuerdas).
            afinacion:
              instrumento === 'guitar'
                ? AFINACIONES[useStudio.getState().guitarra.afinacion]
                : undefined,
            soloTablatura: cuerdas && soloTab,
          })
        : null,
    [score, take, instrumento, cuerdas, soloTab],
  );

  useEffect(() => {
    estado.current = { seleccion, score, instrumento };
  });

  // La barra de edición vive en la hoja mientras haya una pieza abierta.
  useEffect(() => {
    const el = hoja.current;
    if (!el || !abierta) return;
    const aplicar = (ed: Edicion) => {
      const { seleccion: sel, score: sc, instrumento: inst } = estado.current;
      const actual = useStudio.getState().take;
      if (!sel || !sc || !actual) return;
      const afin =
        inst === 'guitar' ? AFINACIONES[useStudio.getState().guitarra.afinacion] : undefined;
      const r = editar(actual, sc, sel, ed, inst, afin);
      useStudio.getState().edit(() => r.take);
      setSeleccion(r.seleccion);
    };
    const b = new BarraEdicion(
      el,
      instrumento,
      aplicar,
      () => setSeleccion(null),
      () => useStudio.getState().undo(),
      () => useStudio.getState().redo(),
    );
    barra.current = b;
    return () => {
      b.quitar();
      barra.current = null;
    };
  }, [abierta, instrumento]);

  useEffect(() => {
    barra.current?.mostrar(seleccion);
    if (holder.current) marcarSeleccion(holder.current, seleccion);
  }, [seleccion]);

  // Dibujo con OpenSheetMusicDisplay (se carga solo al abrir esta pestaña).
  const osmd = useRef<OpenSheetMusicDisplay | null>(null);
  const linea = useRef<LineaDeLectura | null>(null);
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
        // Cada nota de la hoja se puede tocar para editarla (solo con una pieza abierta).
        quitarClics.current?.();
        const sc = estado.current.score;
        if (sc && useStudio.getState().take) {
          quitarClics.current = hacerSeleccionable(
            view as unknown as Parameters<typeof hacerSeleccionable>[0],
            sc,
            estado.current.instrumento,
            (sel) => setSeleccion(sel),
          );
          marcarSeleccion(el, estado.current.seleccion);
        }
        // Cursor suave: se lee una vez dónde cae cada nota y una línea propia se desliza.
        linea.current?.quitar();
        linea.current = new LineaDeLectura(el, el.parentElement ?? el, leerRecorrido(view.cursor));
        osmd.current = view;
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
      osmd.current = null;
      linea.current?.quitar();
      linea.current = null;
    };
  }, [xml]);

  // Cursor sincronizado con la reproducción: en cada cuadro, sin saltos de nota en nota.
  useEffect(() => {
    if (!score || !beats || status !== 'ready') return;
    let raf = 0;
    const loop = () => {
      linea.current?.mover(aRedondas(transport.now(), score.measureTimes, score.bpm, score.time));
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

        {cuerdas && (
          <>
            <h2 className="ui-etiqueta">Ver</h2>
            <Chips
              label="Ver"
              options={VISTAS_TAB}
              value={soloTab ? 'tab' : 'ambas'}
              onChange={(v) => setSoloTab(v === 'tab')}
            />
          </>
        )}

        <h2 className="ui-etiqueta">Compás</h2>
        <Chips label="Compás" options={METERS} value={meter} onChange={setMeter} />

        <h2 className="ui-etiqueta">Exportar</h2>
        <Button
          icon={<Download />}
          disabled={!abierta}
          onClick={() =>
            xml && download(`${base}.musicxml`, xml, 'application/vnd.recordare.musicxml+xml')
          }
        >
          MusicXML
        </Button>
        <Button
          icon={<FileMusic />}
          disabled={!abierta}
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
        <Button icon={<Printer />} disabled={!abierta} onClick={() => window.print()}>
          Imprimir o guardar PDF
        </Button>
        <p className="ui-secundario">
          MusicXML se abre en MuseScore, Sibelius, Finale o Dorico. Para el PDF, elige «Guardar como
          PDF» en la ventana de impresión.
        </p>
      </aside>
      <main ref={hoja} className={styles.hoja} aria-label={`Partitura de ${take.title}`}>
        {abierta && !seleccion && (
          <p className={`ui-secundario ${styles.ayuda}`}>
            Toca una nota (o un silencio) para editarla. Al editar, la pieza toma el ritmo escrito.
          </p>
        )}
        {!abierta && (
          <p className="ui-secundario">
            Hoja vacía. Abre una pieza en el Estudio (un MIDI, una grabación o un audio) para verla
            escrita aquí.
          </p>
        )}
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
