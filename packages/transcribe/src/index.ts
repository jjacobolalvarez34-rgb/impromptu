export { rawToNotes, takeFromTranscription } from './notes';
export type { RawNote, NotesOptions } from './notes';
export {
  transcribe,
  transcribeSamples,
  isTranscriberReady,
  toModelRate,
  TranscriptionCancelled,
  MODEL_RATE,
  DEFAULT_PARAMS,
  PARAMS_CUERDAS,
  prepareTranscriber,
  peakLevel,
} from './transcribe';
export type { TranscribeParams, TranscribeStage, TranscribeOptions } from './transcribe';
export { transcribeTranskun, takeFromTranskun, TRANSKUN_RATE } from './transkun/transcribe';
export type { TranskunStage } from './transkun/transcribe';
export type { TkNote } from './transkun/decode';
export { AvanceSuave, fraseDeEspera, textoRestante } from './avance';
export type { EtapaDeEspera } from './avance';
export { detectarBateria } from './bateria';
export type { Golpe } from './bateria';
export { separarInstrumento, PARTE_DE } from './separar';
export type { Parte, SepararEtapa } from './separar';
export { normalizar } from './volumen';
