import { alignAudioToNotes, toMono, waveformPeaks } from '@impromptu/media';
import { create } from 'zustand';

/**
 * Audio propio (MP3, WAV…) de la misma pieza que el MIDI abierto: se sincroniza solo y
 * puede sonar en lugar del piano de la app, al reproducir y al exportar.
 */
export interface OwnAudio {
  name: string;
  buffer: AudioBuffer;
  /** Picos para dibujar la forma de onda en la línea de tiempo. */
  peaks: Float32Array;
  /** Desfase que dio la sincronía automática (s). */
  autoOffset: number;
  /** Corrección manual del usuario (s, ±0,5). */
  nudge: number;
  confidence: number;
  /** Los dos métodos de sincronía dieron el mismo desfase. */
  agree: boolean;
  /** Sonar con este audio en lugar del piano de la app. */
  use: boolean;
}

export type SyncQuality = 'good' | 'doubtful' | 'mismatch';

/**
 * Umbrales medidos con las grabaciones de Jacobo (parecido de notas):
 * misma pieza 1,09–1,24; piezas distintas 1,01–1,02. Si los dos métodos no coinciden
 * en el desfase (como Sorry, cuyo MP3 es otra versión), la sincronía es dudosa.
 */
export function syncQuality(confidence: number, agree = true): SyncQuality {
  if (confidence < 1.05) return 'mismatch';
  if (!agree || confidence < 1.08) return 'doubtful';
  return 'good';
}

interface OwnAudioState {
  audio: OwnAudio | null;
  analyzing: boolean;
  set: (audio: OwnAudio | null) => void;
  patch: (patch: Partial<OwnAudio>) => void;
}

export const useOwnAudio = create<OwnAudioState>((set, get) => ({
  audio: null,
  analyzing: false,
  set: (audio) => set({ audio }),
  patch: (patch) => {
    const audio = get().audio;
    if (audio) set({ audio: { ...audio, ...patch } });
  },
}));

/** Segundo de la toma en que suena el segundo 0 del audio (MediaRef.offset). */
export const audioOffset = (a: OwnAudio) => a.autoOffset + a.nudge;

const PEAK_COLUMNS = 4000;

export async function analyzeAudio(
  file: File,
  context: BaseAudioContext,
  notes: Parameters<typeof alignAudioToNotes>[2],
): Promise<OwnAudio> {
  const buffer = await context.decodeAudioData(await file.arrayBuffer());
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) =>
    buffer.getChannelData(i),
  );
  const mono = toMono(channels);
  const { offset, confidence, agree } = alignAudioToNotes(mono, buffer.sampleRate, notes);
  return {
    name: file.name.replace(/\.[^.]+$/, ''),
    buffer,
    peaks: waveformPeaks(mono, PEAK_COLUMNS),
    autoOffset: offset,
    nudge: 0,
    confidence,
    agree,
    use: syncQuality(confidence, agree) !== 'mismatch',
  };
}
