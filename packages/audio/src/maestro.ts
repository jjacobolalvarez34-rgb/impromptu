/**
 * Cadena maestra de salida (pedido 32 de Jacobo: con el equipo al 100 % apenas se oía).
 * Compresor suave (empareja lo fuerte y lo suave, como en una mezcla), más volumen y un
 * limitador al final para que nada recorte. La usan el piano y guitarra/bajo/batería, al tocar
 * y al exportar (mismo sonido en el estudio y en el video).
 */
export const VOLUMEN_EXTRA = 2; // ≈ +6 dB

export function cadenaMaestra(context: BaseAudioContext): AudioNode {
  const compresor = context.createDynamicsCompressor();
  compresor.threshold.value = -20;
  compresor.knee.value = 10;
  compresor.ratio.value = 3;
  compresor.attack.value = 0.01;
  compresor.release.value = 0.25;
  const volumen = context.createGain();
  volumen.gain.value = VOLUMEN_EXTRA;
  const limitador = context.createDynamicsCompressor();
  limitador.threshold.value = -1.5;
  limitador.knee.value = 0;
  limitador.ratio.value = 20;
  limitador.attack.value = 0.001;
  limitador.release.value = 0.1;
  compresor.connect(volumen).connect(limitador).connect(context.destination);
  return compresor;
}
