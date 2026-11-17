import { alignAudioToNotes, toMono } from '@impromptu/media';
import type { KeyboardCalibration, NoteEvent, Take } from '@impromptu/core';
import { loadMedia } from './mediaStore';
import { create } from 'zustand';

/**
 * Video de la cámara (importado por ahora): se sincroniza con el MIDI por su sonido
 * (MediaRef.offset) y se muestra según la plantilla (recuadro o fondo).
 */
export interface CameraVideo {
  name: string;
  /** Archivo original (para decodificar cuadros exactos al exportar). */
  file: File;
  url: string;
  element: HTMLVideoElement;
  width: number;
  height: number;
  duration: number;
  autoOffset: number;
  nudge: number;
  /** null si el video no tiene sonido: la sincronía es manual. */
  confidence: number | null;
  agree: boolean;
  /** Teclas reales marcadas sobre el video (plantilla "Cámara arriba"). */
  calibration?: KeyboardCalibration;
}

interface VideoState {
  video: CameraVideo | null;
  loading: boolean;
  set: (video: CameraVideo | null) => void;
  patch: (patch: Partial<CameraVideo>) => void;
}

export const useVideo = create<VideoState>((set, get) => ({
  video: null,
  loading: false,
  set: (video) => {
    const old = get().video;
    if (old && old !== video) {
      old.element.pause();
      URL.revokeObjectURL(old.url);
    }
    set({ video });
  },
  patch: (patch) => {
    const video = get().video;
    if (video) set({ video: { ...video, ...patch } });
  },
}));

/** Video con desfase ya conocido (grabado con la toma): no hace falta sincronizar. */
export async function videoFromFile(
  file: File,
  offset: number,
  name: string,
  calibration?: KeyboardCalibration,
): Promise<CameraVideo> {
  const url = URL.createObjectURL(file);
  const element = await loadElement(url);
  return {
    name,
    file,
    url,
    element,
    width: element.videoWidth,
    height: element.videoHeight,
    duration: element.duration,
    autoOffset: offset,
    nudge: 0,
    confidence: null,
    agree: true,
    ...(calibration ? { calibration } : {}),
  };
}

/** Si la toma tiene un video guardado (OPFS), lo abre con su desfase y su calibración. */
export async function attachTakeVideo(take: Take): Promise<void> {
  const ref = take.media.find((m) => m.kind === 'video');
  if (!ref) return;
  const file = await loadMedia(ref.storageKey);
  if (!file) return;
  const video = await videoFromFile(file, ref.offset, 'Cámara', ref.calibration);
  // Si mientras tanto se abrió otra toma, no se pisa.
  if (useStudioTakeId() === take.id) useVideo.getState().set(video);
}

let currentTakeId: () => string | undefined = () => undefined;
const useStudioTakeId = () => currentTakeId();
/** El store del estudio indica qué toma está abierta (evita una importación circular). */
export function setTakeIdGetter(getter: () => string | undefined): void {
  currentTakeId = getter;
}

/** Segundo de la toma en que se ve el segundo 0 del video. */
export const videoOffset = (v: CameraVideo) => v.autoOffset + v.nudge;

function loadElement(url: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const el = document.createElement('video');
    el.muted = true; // el sonido viene del piano o del audio propio
    el.playsInline = true;
    el.preload = 'auto';
    el.src = url;
    el.onloadeddata = () => resolve(el);
    el.onerror = () => reject(new Error('video'));
  });
}

export async function openVideo(
  file: File,
  context: BaseAudioContext,
  notes: readonly NoteEvent[],
): Promise<CameraVideo> {
  const url = URL.createObjectURL(file);
  const element = await loadElement(url);
  let autoOffset = 0;
  let confidence: number | null = null;
  let agree = true;
  // Si el video trae sonido, se sincroniza solo con el MIDI (como el audio propio).
  try {
    const audio = await context.decodeAudioData(await file.arrayBuffer());
    const mono = toMono(
      Array.from({ length: audio.numberOfChannels }, (_, i) => audio.getChannelData(i)),
    );
    if (notes.length > 0) {
      const result = alignAudioToNotes(mono, audio.sampleRate, notes);
      autoOffset = result.offset;
      confidence = result.confidence;
      agree = result.agree;
    }
  } catch {
    // Sin pista de audio legible: se sincroniza a mano.
  }
  return {
    name: file.name.replace(/\.[^.]+$/, ''),
    file,
    url,
    element,
    width: element.videoWidth,
    height: element.videoHeight,
    duration: element.duration,
    autoOffset,
    nudge: 0,
    confidence,
    agree,
  };
}

/**
 * Mantiene el <video> en el instante que toca (vista previa en vivo). Si se desvía más
 * de 80 ms, se corrige; en pausa, se busca el cuadro exacto.
 */
export function syncVideo(v: CameraVideo, t: number, playing: boolean): boolean {
  const el = v.element;
  const target = t - videoOffset(v);
  if (target < 0 || target > v.duration) {
    if (!el.paused) el.pause();
    return false;
  }
  if (playing) {
    if (el.paused) void el.play().catch(() => undefined);
    if (Math.abs(el.currentTime - target) > 0.08) el.currentTime = target;
  } else {
    if (!el.paused) el.pause();
    if (Math.abs(el.currentTime - target) > 0.04) el.currentTime = target;
  }
  return el.readyState >= 2;
}
