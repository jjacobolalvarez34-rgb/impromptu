import type { KeyboardCalibration } from '@impromptu/core';
import { create } from 'zustand';

/**
 * Cámara en vivo (ARQUITECTURA: getUserMedia + MediaRecorder). Se ve en el visualizador
 * mientras se toca y se graba junto con la toma; el desfase sale de performance.now().
 */
interface CameraState {
  active: boolean;
  starting: boolean;
  error: string | null;
  element: HTMLVideoElement | null;
  width: number;
  height: number;
  /** Calibración hecha sobre la cámara en vivo; pasa al video grabado. */
  calibration?: KeyboardCalibration;
}

export const useCamera = create<CameraState>(() => ({
  active: false,
  starting: false,
  error: null,
  element: null,
  width: 0,
  height: 0,
}));

let stream: MediaStream | null = null;
let recorder: MediaRecorder | null = null;
let chunks: Blob[] = [];
let recordingStartedAt = 0;

/** Pide la cámara (solo cuando el usuario la enciende, VERIFICACIONES §7). */
export async function startCamera(): Promise<void> {
  if (useCamera.getState().active) return;
  useCamera.setState({ starting: true, error: null });
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 60 } },
      audio: false,
    });
    const element = document.createElement('video');
    element.muted = true;
    element.playsInline = true;
    element.srcObject = stream;
    await element.play();
    useCamera.setState({
      active: true,
      starting: false,
      element,
      width: element.videoWidth,
      height: element.videoHeight,
    });
  } catch (e) {
    const denied = e instanceof DOMException && e.name === 'NotAllowedError';
    useCamera.setState({
      starting: false,
      error: denied
        ? 'No diste permiso para la cámara. Actívalo en el candado de la barra de direcciones.'
        : 'No encontramos una cámara. Revisa que esté conectada y que otra app no la esté usando.',
    });
  }
}

export function stopCamera(): void {
  recorder?.stop();
  for (const track of stream?.getTracks() ?? []) track.stop();
  stream = null;
  useCamera.setState({ active: false, element: null });
}

/** Empieza a grabar la cámara; devuelve el instante (performance.now, s) en que arrancó. */
export function startCameraRecording(): number | null {
  if (!stream) return null;
  // VP8 primero: es el más liviano de codificar en vivo (VP9 en 1080p no daba abasto).
  const type = ['video/webm;codecs=vp8', 'video/webm', 'video/webm;codecs=vp9', 'video/mp4'].find(
    (t) => MediaRecorder.isTypeSupported(t),
  );
  chunks = [];
  recorder = new MediaRecorder(stream, {
    ...(type ? { mimeType: type } : {}),
    videoBitsPerSecond: 8_000_000,
  });
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  recorder.start(1000);
  recordingStartedAt = performance.now() / 1000;
  return recordingStartedAt;
}

/** Detiene la grabación de la cámara y entrega el archivo y cuándo empezó. */
export function stopCameraRecording(): Promise<{ file: File; startedAt: number } | null> {
  const rec = recorder;
  if (!rec || rec.state === 'inactive') return Promise.resolve(null);
  return new Promise((resolve) => {
    rec.onstop = () => {
      const type = rec.mimeType || 'video/webm';
      const ext = type.includes('mp4') ? 'mp4' : 'webm';
      const file = new File(chunks, `camara.${ext}`, { type });
      recorder = null;
      resolve({ file, startedAt: recordingStartedAt });
    };
    rec.requestData();
    rec.stop();
  });
}
