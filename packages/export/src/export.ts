import { Piano, takeVoices } from '@impromptu/audio';
import type { KeyboardCalibration, Take } from '@impromptu/core';
import { Visualizer } from '@impromptu/render';
import type { VisualSettings } from '@impromptu/render';
import {
  ALL_FORMATS,
  AudioBufferSource,
  BlobSource,
  BufferTarget,
  CanvasSink,
  Input,
  CanvasSource,
  Mp4OutputFormat,
  Output,
  QUALITY_HIGH,
  WebMOutputFormat,
  canEncodeAudio,
  canEncodeVideo,
} from 'mediabunny';
import { TAIL, fadeOut, frameCount, frameSize, frameTime } from './formats';
import type { Aspect, FrameRate, Resolution } from './formats';

export interface ExportOptions {
  take: Take;
  settings: VisualSettings;
  aspect: Aspect;
  resolution: Resolution;
  fps: FrameRate;
  /** Piano ya cargado cuyas muestras se reutilizan; sin él, el video sale sin audio. */
  piano?: Piano | null;
  /**
   * Audio propio de la pieza (MP3, WAV…) que suena en lugar del piano. `offset`: segundo
   * de la toma en que suena el segundo 0 del archivo (MediaRef.offset).
   */
  ownAudio?: { buffer: AudioBuffer; offset: number } | null;
  /**
   * Video de la cámara para las plantillas que lo usan. Cada cuadro sale decodificado del
   * archivo en el instante exacto (no del reproductor), con su desfase y su calibración.
   */
  video?: { file: Blob; offset: number; calibration?: KeyboardCalibration } | null;
  onProgress?: (progress: ExportProgress) => void;
  signal?: AbortSignal;
}

export interface ExportProgress {
  phase: 'audio' | 'video' | 'final';
  /** 0–1 */
  value: number;
}

export interface ExportResult {
  blob: Blob;
  extension: 'mp4' | 'webm';
  width: number;
  height: number;
  frames: number;
}

export type ExportError = 'unsupported' | 'cancelled';

export class ExportFailure extends Error {
  constructor(readonly reason: ExportError) {
    super(reason);
  }
}

const SAMPLE_RATE = 48_000;

/**
 * Elige contenedor y códecs según lo que el navegador sabe codificar (BUGS B-011):
 * MP4 con H.264 + AAC; si no, WebM con VP9 + Opus.
 */
export async function chooseFormat(width: number, height: number) {
  const size = { width, height };
  if ((await canEncodeVideo('avc', size)) && (await canEncodeAudio('aac'))) {
    return { extension: 'mp4' as const, video: 'avc' as const, audio: 'aac' as const };
  }
  if ((await canEncodeVideo('vp9', size)) && (await canEncodeAudio('opus'))) {
    return { extension: 'webm' as const, video: 'vp9' as const, audio: 'opus' as const };
  }
  return null;
}

/**
 * Exporta la toma a video. Cada cuadro se dibuja solo con t = N / fps (render offline
 * determinista, ADR-004): nunca se graba la pantalla.
 */
export async function exportVideo(opts: ExportOptions): Promise<ExportResult> {
  const { take, fps, signal } = opts;
  const { width, height } = frameSize(opts.aspect, opts.resolution);
  const format = await chooseFormat(width, height);
  if (!format) throw new ExportFailure('unsupported');
  const check = () => {
    if (signal?.aborted) throw new ExportFailure('cancelled');
  };

  // 1. Audio: el piano se toca en un OfflineAudioContext, más rápido que el tiempo real.
  let audio: AudioBuffer | null = null;
  if (opts.ownAudio) {
    opts.onProgress?.({ phase: 'audio', value: 0 });
    audio = await renderOwnAudio(take, opts.ownAudio.buffer, opts.ownAudio.offset);
    check();
  } else if (opts.piano?.loaded) {
    opts.onProgress?.({ phase: 'audio', value: 0 });
    audio = await renderPianoAudio(
      take,
      opts.piano,
      (value) => opts.onProgress?.({ phase: 'audio', value }),
      signal,
    );
    check();
  }

  // 2. Video
  const output = new Output({
    format:
      format.extension === 'mp4'
        ? new Mp4OutputFormat({ fastStart: 'in-memory' })
        : new WebMOutputFormat(),
    target: new BufferTarget(),
  });
  const viz = await Visualizer.create({
    width,
    height,
    resolution: 1,
    preserveDrawingBuffer: true,
  });
  try {
    viz.setTake(take);
    viz.setSettings(opts.settings);
    const video = new CanvasSource(viz.canvas, {
      codec: format.video,
      bitrate: QUALITY_HIGH,
      keyFrameInterval: 2,
    });
    output.addVideoTrack(video, { frameRate: fps });
    const audioSource = audio
      ? new AudioBufferSource({ codec: format.audio, bitrate: QUALITY_HIGH })
      : null;
    if (audioSource) output.addAudioTrack(audioSource);
    await output.start();

    if (audioSource && audio) await audioSource.add(audio);

    const total = frameCount(take.duration, fps);
    const frames = opts.video ? await videoFrames(opts.video, total, fps) : null;
    viz.setCalibration(opts.video?.calibration ?? null);
    for (let i = 0; i < total; i++) {
      if (signal?.aborted) {
        await output.cancel();
        throw new ExportFailure('cancelled');
      }
      if (frames) {
        const frame = await frames.next(i);
        viz.setVideoFrame(frame?.canvas ?? null, frame?.width ?? 0, frame?.height ?? 0);
      }
      viz.render(frameTime(i, fps));
      await video.add(frameTime(i, fps), 1 / fps);
      if (i % 15 === 0) opts.onProgress?.({ phase: 'video', value: i / total });
    }
    opts.onProgress?.({ phase: 'final', value: 1 });
    await output.finalize();
    const buffer = output.target.buffer;
    if (!buffer) throw new Error('El archivo quedó vacío');
    return {
      blob: new Blob([buffer], { type: format.extension === 'mp4' ? 'video/mp4' : 'video/webm' }),
      extension: format.extension,
      width,
      height,
      frames: total,
    };
  } finally {
    viz.destroy();
  }
}

/** Cada cuánto (s de audio) el render offline se detiene a informar y a revisar si se canceló. */
const AUDIO_STEP = 5;

/**
 * Audio de la toma con el piano incluido, hecho fuera de tiempo real. Se pausa cada
 * AUDIO_STEP segundos para informar el avance y permitir cancelar (el navegador no deja
 * interrumpir un OfflineAudioContext; si se cancela, simplemente no se reanuda).
 */
export async function renderPianoAudio(
  take: Take,
  source: Piano,
  onProgress?: (value: number) => void,
  signal?: AbortSignal,
): Promise<AudioBuffer> {
  const seconds = take.duration + TAIL;
  const length = Math.ceil(seconds * SAMPLE_RATE);
  const context = new OfflineAudioContext(2, length, SAMPLE_RATE);
  const piano = new Piano(context);
  piano.shareSamplesFrom(source);
  for (const voice of takeVoices(take)) piano.play(voice, voice.start, voice.release);

  return new Promise<AudioBuffer>((resolve, reject) => {
    for (let t = AUDIO_STEP; t < seconds; t += AUDIO_STEP) {
      void context.suspend(t).then(() => {
        if (signal?.aborted) return reject(new ExportFailure('cancelled'));
        onProgress?.(t / seconds);
        void context.resume();
      });
    }
    signal?.addEventListener('abort', () => reject(new ExportFailure('cancelled')), { once: true });
    context.startRendering().then((b) => resolve(fadeOut(b)), reject);
  });
}

/** Audio propio colocado en la línea de tiempo de la toma, a 48 kHz y con la duración del video. */
export async function renderOwnAudio(
  take: Take,
  buffer: AudioBuffer,
  offset: number,
): Promise<AudioBuffer> {
  const length = Math.ceil((take.duration + TAIL) * SAMPLE_RATE);
  const context = new OfflineAudioContext(2, length, SAMPLE_RATE);
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  // offset > 0: el audio entra más tarde; offset < 0: se salta su comienzo.
  source.start(Math.max(0, offset), Math.max(0, -offset));
  return fadeOut(await context.startRendering());
}

interface DecodedFrame {
  canvas: CanvasImageSource;
  width: number;
  height: number;
}

/**
 * Cuadros del video de la cámara para cada cuadro del video final, en orden. Se piden
 * todos de una vez para que el decodificador avance sin volver a buscar.
 */
async function videoFrames(
  video: { file: Blob; offset: number },
  total: number,
  fps: FrameRate,
): Promise<{ next: (i: number) => Promise<DecodedFrame | null> }> {
  const input = new Input({ source: new BlobSource(video.file), formats: ALL_FORMATS });
  const track = await input.getPrimaryVideoTrack();
  if (!track) return { next: async () => null };
  const duration = await track.computeDuration();
  const width = Math.min(1920, track.displayWidth);
  const height = Math.round((track.displayHeight * width) / track.displayWidth);
  const sink = new CanvasSink(track, { width, height, fit: 'fill', poolSize: 2 });
  const times = Array.from({ length: total }, (_, i) =>
    Math.max(0, frameTime(i, fps) - video.offset),
  );
  const iterator = sink.canvasesAtTimestamps(times);
  return {
    next: async (i) => {
      const result = await iterator.next();
      const t = frameTime(i, fps) - video.offset;
      // Antes de que empiece o después de que termine el video: sin cámara en ese cuadro.
      if (result.done || !result.value || t < 0 || t > duration) return null;
      return { canvas: result.value.canvas, width, height };
    },
  };
}
