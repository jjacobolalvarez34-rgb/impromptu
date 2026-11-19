import type { Piano, Sintes } from '@impromptu/audio';
import type { Take } from '@impromptu/core';
import {
  AudioBufferSource,
  BufferTarget,
  CanvasSource,
  Mp4OutputFormat,
  Output,
  QUALITY_HIGH,
  WebMOutputFormat,
} from 'mediabunny';
import { ExportFailure, chooseFormat, renderPianoAudio } from './export';
import type { ExportProgress, ExportResult } from './export';
import { FADE_OUT, TAIL, frameCount, frameSize, frameTime } from './formats';
import type { Aspect, FrameRate, Resolution } from './formats';

/**
 * Video de la partitura (fase 10, pedido de Jacobo): la hoja con la línea ámbar avanzando al
 * compás y desplazándose renglón por renglón, con el mismo audio del video del visualizador.
 * Cada cuadro se dibuja con t = N / fps (render offline determinista, ADR-004).
 */
export interface VideoPartituraOpciones {
  take: Take;
  /** La hoja ya dibujada (SVG de OpenSheetMusicDisplay pasado a imagen) y su tamaño en px. */
  hoja: CanvasImageSource;
  anchoHoja: number;
  altoHoja: number;
  /** Dónde va la línea en el segundo t (px de la hoja), o null antes de empezar. */
  cursor: (t: number) => { x: number; y: number; alto: number } | null;
  aspect: Aspect;
  resolution: Resolution;
  fps: FrameRate;
  piano?: Piano | null;
  sintes?: Sintes | null;
  onProgress?: (p: ExportProgress) => void;
  signal?: AbortSignal;
}

const PAPEL = '#F7F3EA';
const FONDO = '#1C1C1A';
const AMBAR = '#FF9F1C';

export async function exportarVideoPartitura(o: VideoPartituraOpciones): Promise<ExportResult> {
  const { width, height } = frameSize(o.aspect, o.resolution);
  const formato = await chooseFormat(width, height);
  if (!formato) throw new ExportFailure('unsupported');
  const revisar = () => {
    if (o.signal?.aborted) throw new ExportFailure('cancelled');
  };

  o.onProgress?.({ phase: 'audio', value: 0 });
  const audio = await renderPianoAudio(
    o.take,
    o.piano ?? null,
    (value) => o.onProgress?.({ phase: 'audio', value }),
    o.signal,
    o.sintes ?? null,
  );
  revisar();

  const salida = new Output({
    format:
      formato.extension === 'mp4'
        ? new Mp4OutputFormat({ fastStart: 'in-memory' })
        : new WebMOutputFormat(),
    target: new BufferTarget(),
  });
  const lienzo = document.createElement('canvas');
  lienzo.width = width;
  lienzo.height = height;
  const ctx = lienzo.getContext('2d')!;
  const video = new CanvasSource(lienzo, {
    codec: formato.video,
    bitrate: QUALITY_HIGH,
    keyFrameInterval: 2,
  });
  salida.addVideoTrack(video, { frameRate: o.fps });
  const fuente = new AudioBufferSource({ codec: formato.audio, bitrate: QUALITY_HIGH });
  salida.addAudioTrack(fuente);
  await salida.start();
  await fuente.add(audio);

  // La hoja ocupa casi todo el ancho; se desplaza para que el renglón que suena quede a un tercio.
  const margen = Math.round(width * 0.03);
  const escala = (width - margen * 2) / o.anchoHoja;
  const altoEscalado = o.altoHoja * escala;
  const suavizado = 1 - Math.pow(0.85, 30 / o.fps);
  let desplazado = 0;
  const total = frameCount(o.take.duration, o.fps);
  const fin = o.take.duration + TAIL;
  for (let i = 0; i < total; i++) {
    if (o.signal?.aborted) {
      await salida.cancel();
      throw new ExportFailure('cancelled');
    }
    const t = frameTime(i, o.fps);
    const c = o.cursor(t);
    if (c) {
      const objetivo = Math.min(
        Math.max(0, c.y * escala - height * 0.3),
        Math.max(0, altoEscalado - height + margen),
      );
      desplazado = i === 0 ? objetivo : desplazado + (objetivo - desplazado) * suavizado;
    }
    ctx.fillStyle = FONDO;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = PAPEL;
    ctx.fillRect(margen / 2, margen / 2 - desplazado, width - margen, altoEscalado + margen);
    ctx.drawImage(o.hoja, margen, margen - desplazado, o.anchoHoja * escala, altoEscalado);
    if (c) {
      const x = margen + c.x * escala;
      const y = margen + c.y * escala - desplazado;
      ctx.save();
      ctx.shadowColor = 'rgba(255,159,28,0.7)';
      ctx.shadowBlur = 14 * (width / 1920);
      ctx.fillStyle = AMBAR;
      ctx.fillRect(x - 2 * (width / 1920), y, Math.max(3, 4 * (width / 1920)), c.alto * escala);
      ctx.restore();
    }
    const resta = fin - t;
    if (resta < FADE_OUT) {
      ctx.fillStyle = `rgba(0,0,0,${Math.min(1, Math.max(0, 1 - resta / FADE_OUT))})`;
      ctx.fillRect(0, 0, width, height);
    }
    await video.add(t, 1 / o.fps);
    if (i % 15 === 0) o.onProgress?.({ phase: 'video', value: i / total });
  }
  o.onProgress?.({ phase: 'final', value: 1 });
  await salida.finalize();
  const buffer = salida.target.buffer;
  if (!buffer) throw new Error('El archivo quedó vacío');
  return {
    blob: new Blob([buffer], { type: formato.extension === 'mp4' ? 'video/mp4' : 'video/webm' }),
    extension: formato.extension,
    width,
    height,
    frames: total,
  };
}
