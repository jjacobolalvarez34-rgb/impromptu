/**
 * Muestras del Salamander Grand Piano (Alexander Holm, CC-BY 3.0; ver docs/LICENCIAS.md).
 * Hay una muestra cada 3 semitonos (A0 a C8) y 16 capas de fuerza (v1 a v16).
 */

/** PROVISIONAL(P15): copia pública del Salamander en MP3. Mover a un espejo propio antes de v0.1. */
export const DEFAULT_SAMPLE_BASE = 'https://tambien.github.io/Piano/audio/';

/** Capas de fuerza que se descargan: 5 de 16 (unos 30 MB) dan matices sin pesar tanto. */
export const DEFAULT_LAYERS = [1, 5, 9, 13, 16] as const;

const NAMES: Readonly<Record<number, string>> = { 0: 'C', 3: 'Ds', 6: 'Fs', 9: 'A' };

/** Teclas muestreadas: 21 (A0), 24, 27, …, 108 (C8). */
export const SAMPLED_PITCHES: readonly number[] = Array.from({ length: 30 }, (_, i) => 21 + i * 3);

export function sampleName(pitch: number, layer: number): string {
  const name = NAMES[pitch % 12];
  if (!name) throw new Error(`La tecla ${pitch} no tiene muestra`);
  return `${name}${Math.floor(pitch / 12) - 1}v${layer}`;
}

/** Muestra más cercana a una tecla (a lo sumo 1 semitono de distancia, o los extremos). */
export function nearestSample(pitch: number): number {
  const clamped = Math.min(108, Math.max(21, pitch));
  return 21 + Math.round((clamped - 21) / 3) * 3;
}

/**
 * Capa de fuerza para una velocity 1–127. Las capas se reparten a lo largo del rango de
 * velocity como en el Salamander (v1 = muy suave, v16 = fortísimo).
 */
export function layerFor(velocity: number, layers: readonly number[] = DEFAULT_LAYERS): number {
  const v = Math.min(127, Math.max(1, velocity));
  // Cada capa del Salamander cubre unas 8 velocity: v1 ≈ 1–8, …, v16 ≈ 120–127.
  const target = Math.ceil((v / 127) * 16);
  let best = layers[0]!;
  for (const l of layers) if (Math.abs(l - target) < Math.abs(best - target)) best = l;
  return best;
}

/**
 * Ganancia dentro de la capa: corrige la diferencia entre la velocity real y la capa
 * elegida, para que los matices sean continuos aunque haya pocas capas.
 */
export function layerGain(velocity: number, layer: number): number {
  const wanted = Math.min(127, Math.max(1, velocity)) / 127;
  const layerVelocity = layer / 16;
  return Math.min(1.6, Math.max(0.35, Math.pow(wanted / layerVelocity, 0.8)));
}

export function allSampleNames(layers: readonly number[] = DEFAULT_LAYERS): string[] {
  return SAMPLED_PITCHES.flatMap((p) => layers.map((l) => sampleName(p, l)));
}
