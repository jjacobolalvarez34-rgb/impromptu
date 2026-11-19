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
  posicionEn,
  quantizedTake,
  toMusicXml,
} from '@impromptu/notation';
import type { Edicion, Score, Seleccion } from '@impromptu/notation';
import { Button, Chips } from '@impromptu/ui';
import { Circle, Download, FileMusic, Film, Mic, Printer, Square } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import { AFINACIONES, createTake, createTrack } from '@impromptu/core';
import type { Instrument, Take } from '@impromptu/core';
import { instrumentoDe } from '@impromptu/render';
import { exportarVideoPartitura, fileName } from '@impromptu/export';
import { engine } from '../studio/audio';
import { live, useLive } from '../studio/live';
import { useTranscribe } from '../studio/transcribeStore';
import { useMetronome } from '../studio/metronome';
import { MetronomeControls } from '../studio/LivePanel';
import { midiFileName } from '../studio/saveMidi';
import {
  actualizarTrabajo,
  descargar,
  nuevoTrabajo,
  quitarTrabajo,
  terminarTrabajo,
  useTrabajos,
} from '../studio/trabajos';
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
  // Grabar directo en la partitura (fase 10): mientras se toca, la hoja se escribe sola.
  const conTeclado = useLive((s) => s.recording);
  // Con el micrófono: la IA en vivo escribe con ~1 s de retraso; al parar, la IA repasa todo.
  const conMic = useTranscribe((s) => s.state.step === 'recording');
  const estadoMic = useTranscribe((s) => s.state);
  const grabando = conTeclado || conMic;
  const conectado = useLive((s) => s.device !== null);
  const [provisional, setProvisional] = useState<Take | null>(null);
  // Si el teclado ya tenía permiso, queda conectado sin pasar por el Estudio.
  useEffect(() => {
    void live.autoConnect();
  }, []);
  useEffect(() => {
    if (!grabando) return;
    const tomar = () => setProvisional(live.provisional() ?? live.oidoProvisional());
    const primera = window.setTimeout(tomar, 0);
    const id = window.setInterval(tomar, 1000);
    return () => {
      window.clearTimeout(primera);
      window.clearInterval(id);
      setProvisional(null);
      // Se deja de juntar lo que oye el micrófono (también si se paró desde el Estudio).
      live.escucharEnHoja(false);
    };
  }, [grabando]);
  const grabarEnHoja = () => {
    transport.pause();
    useStudio.setState({ playing: false });
    live.startRecording();
  };
  const grabarConMic = () => {
    transport.pause();
    useStudio.setState({ playing: false });
    live.escucharEnHoja(true);
    void useTranscribe.getState().startMic();
  };
  const pararMic = () => {
    useTranscribe.getState().stopMic();
    live.escucharEnHoja(false);
  };
  const pararGrabacion = async () => {
    const hecha = await live.stopRecording();
    if (hecha) useStudio.getState().open(hecha);
  };
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
  const take = (grabando ? provisional : null) ?? abierta ?? vacia;
  const instrumento = take ? instrumentoDe(take) : elegido;
  const cuerdas = instrumento === 'guitar' || instrumento === 'bass';
  const [soloTab, setSoloTab] = useState(false);
  const [meter, setMeter] = useState<Meter>(
    (take?.timeSignature ? `${take.timeSignature[0]}/${take.timeSignature[1]}` : '4/4') as Meter,
  );
  const [manualBpm, setManualBpm] = useState<number | null>(null);
  const holder = useRef<HTMLDivElement>(null);
  const recorrido = useRef<ReturnType<typeof leerRecorrido> | null>(null);
  // Video de la partitura (fase 10): se arma en segundo plano (pedido 29), aunque se cambie
  // de pestaña o de instrumento, y se descarga solo al terminar.
  const videoEnCurso = useTrabajos((s) =>
    s.lista.find((t) => t.tipo === 'video-partitura' && t.estado === 'trabajando'),
  );
  const [errorVideo, setErrorVideo] = useState<string | null>(null);

  const exportarHoja = async () => {
    const el = holder.current;
    const svg = el?.querySelector('svg');
    const sc = estado.current.score;
    const actual = useStudio.getState().take;
    if (!el || !svg || !sc || !actual || !recorrido.current) return;
    const control = new AbortController();
    setErrorVideo(null);
    try {
      // La hoja dibujada pasa a imagen (las posiciones del cursor van relativas a ella).
      const cajaSvg = svg.getBoundingClientRect();
      const cajaHoja = el.getBoundingClientRect();
      const dx = cajaSvg.left - cajaHoja.left;
      const dy = cajaSvg.top - cajaHoja.top;
      const texto = new XMLSerializer().serializeToString(svg);
      const url = URL.createObjectURL(new Blob([texto], { type: 'image/svg+xml' }));
      const imagen = new Image();
      await new Promise<void>((ok, mal) => {
        imagen.onload = () => ok();
        imagen.onerror = () => mal(new Error('No se pudo leer la hoja'));
        imagen.src = url;
      });
      URL.revokeObjectURL(url);
      const r = recorrido.current;
      const id = nuevoTrabajo('video-partitura', `Video de la partitura: ${actual.title}`, () =>
        control.abort(),
      );
      // Desde aquí ya no depende de la pestaña: sigue aunque se cierre.
      void exportarVideoPartitura({
        take: actual,
        hoja: imagen,
        anchoHoja: cajaSvg.width,
        altoHoja: cajaSvg.height,
        cursor: (t) => {
          const pos = posicionEn(r.puntos, r.fines, aRedondas(t, sc.measureTimes, sc.bpm, sc.time));
          return pos ? { x: pos.x - dx, y: pos.y - dy, alto: pos.alto } : null;
        },
        aspect: useStudio.getState().aspect,
        resolution: '1080p',
        fps: 30,
        piano: engine.loadedPiano,
        sintes: engine.sintes,
        signal: control.signal,
        onProgress: ({ phase, value }) =>
          actualizarTrabajo(id, { avance: phase === 'audio' ? value * 0.1 : 0.1 + value * 0.9 }),
      })
        .then((resultado) => {
          descargar(resultado.blob, fileName(`${actual.title} (partitura)`, resultado.extension));
          terminarTrabajo(id, { estado: 'listo', avance: 1 });
        })
        .catch((e: unknown) => {
          if (control.signal.aborted) quitarTrabajo(id);
          else
            terminarTrabajo(id, {
              estado: 'error',
              mensaje: e instanceof Error ? e.message : 'No se pudo armar el video.',
            });
        });
    } catch (e) {
      setErrorVideo(e instanceof Error ? e.message : 'No se pudo preparar la hoja.');
    }
  };
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
    if (grabando && provisional) {
      const bpm = take.tempoMap[0]?.bpm ?? manualBpm ?? useMetronome.getState().bpm;
      return beatsOf(take, { bpm, first: 0 });
    }
    if (manualBpm === null) return beatsOf(take);
    const first = Math.min(...take.tracks.flatMap((t) => t.notes.map((n) => n.start)), 0);
    return beatsOf(take, { bpm: manualBpm, first: Math.max(0, first) });
  }, [take, manualBpm, grabando, provisional]);

  const score: Score | null = useMemo(() => {
    if (!take || !beats) return null;
    const [n, d] = meter.split('/').map(Number) as [number, number];
    return buildScore(take, {
      beats,
      timeSignature: [n, d],
      instrument: instrumento,
      compasesMinimos: abierta && !grabando ? 1 : 4,
    });
  }, [take, beats, meter, instrumento, abierta, grabando]);

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
    if (!el || !abierta || grabando) return;
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
  }, [abierta, instrumento, grabando]);

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
        const enVivo =
          useLive.getState().recording || useTranscribe.getState().state.step === 'recording';
        if (!enVivo) setStatus('loading');
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
        if (sc && useStudio.getState().take && !enVivo) {
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
        recorrido.current = leerRecorrido(view.cursor);
        linea.current = new LineaDeLectura(el, el.parentElement ?? el, recorrido.current);
        osmd.current = view;
        setStatus('ready');
        // Grabando: la hoja baja sola hasta lo último que se tocó.
        if (enVivo) {
          const caja = hoja.current;
          caja?.scrollTo({ top: caja.scrollHeight });
        }
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
      const t = useLive.getState().recording
        ? live.elapsed()
        : useTranscribe.getState().state.step === 'recording'
          ? live.oidoTranscurrido()
          : transport.now();
      linea.current?.mover(aRedondas(t, score.measureTimes, score.bpm, score.time));
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
        <h2 className="ui-etiqueta">Grabar</h2>
        {conTeclado ? (
          <Button variant="stop" icon={<Square />} onClick={() => void pararGrabacion()}>
            Parar y abrir
          </Button>
        ) : conMic ? (
          <Button variant="stop" icon={<Square />} onClick={pararMic}>
            Parar el micrófono
          </Button>
        ) : (
          <>
            <Button icon={<Circle />} disabled={!conectado} onClick={grabarEnHoja}>
              Grabar en la partitura
            </Button>
            <Button icon={<Mic />} onClick={grabarConMic}>
              Grabar con el micrófono
            </Button>
          </>
        )}
        <p className="ui-secundario">
          {conTeclado
            ? 'Toca: la hoja se escribe sola mientras grabas. Con el metrónomo encendido, los compases caen en su lugar.'
            : conMic
              ? 'Toca: las notas aparecen con un segundo de retraso. Al parar, la IA repasa todo y la pieza se abre aquí.'
              : conectado
                ? 'Con el teclado, la hoja se escribe mientras tocas. Con el micrófono, la IA escucha y escribe.'
                : 'Conecta el teclado en el Estudio (En vivo) para grabar directo en la hoja, o usa el micrófono.'}
        </p>
        {estadoMic.step === 'error' && <p className="ui-secundario">{estadoMic.message}</p>}
        {!grabando && conectado && <MetronomeControls />}

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
          disabled={!abierta || grabando}
          onClick={() =>
            xml && download(`${base}.musicxml`, xml, 'application/vnd.recordare.musicxml+xml')
          }
        >
          MusicXML
        </Button>
        <Button
          icon={<FileMusic />}
          disabled={!abierta || grabando}
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
        {videoEnCurso ? (
          <p className="ui-secundario" role="status">
            Armando el video… {Math.round(videoEnCurso.avance * 100)} %. Sigue aunque cambies de
            pestaña; se descarga solo al terminar.
          </p>
        ) : (
          <Button
            icon={<Film />}
            disabled={!abierta || grabando}
            onClick={() => void exportarHoja()}
          >
            Video de la partitura
          </Button>
        )}
        {errorVideo && <p className="ui-secundario">{errorVideo}</p>}
        <Button icon={<Printer />} disabled={!abierta || grabando} onClick={() => window.print()}>
          Imprimir o guardar PDF
        </Button>
        <p className="ui-secundario">
          MusicXML se abre en MuseScore, Sibelius, Finale o Dorico. Para el PDF, elige «Guardar como
          PDF» en la ventana de impresión.
        </p>
      </aside>
      <main ref={hoja} className={styles.hoja} aria-label={`Partitura de ${take.title}`}>
        {abierta && !grabando && !seleccion && (
          <p className={`ui-secundario ${styles.ayuda}`}>
            Toca una nota (o un silencio) para editarla. Al editar, la pieza toma el ritmo escrito.
          </p>
        )}
        {!abierta && !grabando && (
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
