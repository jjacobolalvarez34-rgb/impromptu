/**
 * Pedido 55: una guitarra acústica grabada con el micrófono llega muy bajita y la IA no encuentra
 * notas. Antes de transcribir se sube el volumen hasta que lo más fuerte quede cerca del máximo
 * (sin pasar de 30 veces, para no levantar puro ruido). El pico ignora el 0,05 % más alto, así un
 * golpe o un clic suelto no impide subirlo. Igual que `Volumen.kt` en el celular.
 */
export const OBJETIVO = 0.9;
export const GANANCIA_MAXIMA = 30;

/** Pico "robusto": el valor por debajo del cual queda el 99,95 % de las muestras. */
export function pico(x: Float32Array): number {
  if (x.length === 0) return 0;
  const paso = Math.max(1, Math.floor(x.length / 200_000));
  const muestra = new Float32Array(Math.ceil(x.length / paso));
  for (let i = 0; i < muestra.length; i++) muestra[i] = Math.abs(x[i * paso]!);
  muestra.sort();
  return muestra[Math.min(muestra.length - 1, Math.floor(muestra.length * 0.9995))]!;
}

/** Sube el volumen en el mismo arreglo y devuelve la ganancia usada. */
export function normalizar(x: Float32Array): number {
  const p = pico(x);
  if (p < 1e-4 || p >= OBJETIVO) return 1;
  const g = Math.min(GANANCIA_MAXIMA, OBJETIVO / p);
  for (let i = 0; i < x.length; i++) x[i] = Math.max(-1, Math.min(1, x[i]! * g));
  return g;
}
