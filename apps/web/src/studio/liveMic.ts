import { MODEL_RATE, rawToNotes, transcribeSamples } from '@impromptu/transcribe';
import { live, liveNow } from './live';

/**
 * Escucha en vivo con el micrófono (pedido de Jacobo: "que al tocar aparezca, como con MIDI").
 * Cada segundo se pasa a la IA rápida (Basic Pitch) el último tramo de audio, con medio
 * segundo de contexto antes, y las notas nuevas suben en la vista en vivo. Llegan con ~1 s de
 * retraso: es el tiempo que tarda la IA en escuchar un bloque en un equipo como el de Jacobo.
 * Al detener, el modelo elegido repasa toda la grabación (transcribeStore).
 */

/** Cada cuánto se escucha un bloque (s). */
const STEP = 1;
/** Contexto antes del tramo nuevo, para no perder ataques en el borde (s). */
const CONTEXT = 0.5;
/** Lo último del bloque puede estar a medias: se vuelve a escuchar en el siguiente (s). */
const GUARD = 0.3;

/** Procesador de audio que solo copia la entrada del micrófono al hilo principal. */
const WORKLET = `
class Captura extends AudioWorkletProcessor {
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (ch) this.port.postMessage(ch.slice(0));
    return true;
  }
}
registerProcessor('impromptu-captura', Captura);
`;

let workletUrl: string | null = null;

export class LiveListener {
  private chunks: Float32Array[] = [];
  private length = 0;
  private rate = 48_000;
  /** Reloj en vivo (liveNow) del primer sample capturado. */
  private origin = 0;
  /** Hasta qué segundo de la grabación ya se mostraron notas. */
  private done = 0;
  private timer = 0;
  private busy = false;
  private stopped = false;
  private nodes: AudioNode[] = [];
  /** Notas ya mostradas (tecla y segundo), para no repetir las de los bordes. */
  private shown: { pitch: number; start: number }[] = [];

  async start(stream: MediaStream, context: AudioContext): Promise<void> {
    this.rate = context.sampleRate;
    workletUrl ??= URL.createObjectURL(new Blob([WORKLET], { type: 'text/javascript' }));
    await context.audioWorklet.addModule(workletUrl);
    const source = context.createMediaStreamSource(stream);
    const node = new AudioWorkletNode(context, 'impromptu-captura');
    // El nodo tiene que estar conectado para que el navegador lo procese; sale en silencio.
    const mute = context.createGain();
    mute.gain.value = 0;
    source.connect(node).connect(mute).connect(context.destination);
    this.nodes = [source, node, mute];
    node.port.onmessage = (e: MessageEvent<Float32Array>) => {
      if (this.length === 0) this.origin = liveNow() - e.data.length / this.rate;
      this.chunks.push(e.data);
      this.length += e.data.length;
    };
    this.timer = window.setInterval(() => void this.tick(), STEP * 1000);
  }

  stop(): void {
    this.stopped = true;
    window.clearInterval(this.timer);
    for (const n of this.nodes) n.disconnect();
    this.nodes = [];
  }

  /** Audio desde `from` (s de grabación) hasta el final, en una sola tira. */
  private slice(from: number): Float32Array {
    const start = Math.max(0, Math.floor(from * this.rate));
    const out = new Float32Array(Math.max(0, this.length - start));
    let at = 0;
    let pos = 0;
    for (const c of this.chunks) {
      const end = pos + c.length;
      if (end > start) {
        const s = Math.max(0, start - pos);
        out.set(c.subarray(s), at);
        at += c.length - s;
      }
      pos = end;
    }
    return out;
  }

  private async tick(): Promise<void> {
    if (this.busy || this.stopped || this.length === 0) return;
    this.busy = true;
    try {
      const total = this.length / this.rate;
      const from = Math.max(0, this.done - CONTEXT);
      const audio = this.slice(from);
      const samples = await resample(audio, this.rate);
      const notes = rawToNotes(await transcribeSamples(samples));
      if (this.stopped) return;
      const until = total - GUARD;
      const fresh = notes
        .map((n) => ({ ...n, start: n.start + from, end: n.end + from }))
        .filter((n) => n.start >= this.done - 0.05 && n.start < until)
        .filter(
          (n) => !this.shown.some((m) => m.pitch === n.pitch && Math.abs(m.start - n.start) < 0.08),
        );
      for (const n of fresh) this.shown.push({ pitch: n.pitch, start: n.start });
      if (fresh.length > 0) {
        live.pushHeard(
          fresh.map((n) => ({
            pitch: n.pitch,
            start: this.origin + n.start,
            end: this.origin + n.end,
            velocity: n.velocity,
          })),
        );
      }
      this.done = Math.max(this.done, until);
    } catch {
      // Un bloque que falla no corta la grabación: el repaso final igual lo transcribe.
    } finally {
      this.busy = false;
    }
  }
}

/** Remuestrea a 22 050 Hz (lo que espera Basic Pitch) con el remuestreador del navegador. */
async function resample(audio: Float32Array, rate: number): Promise<Float32Array> {
  const seconds = audio.length / rate;
  const length = Math.max(1, Math.ceil(seconds * MODEL_RATE));
  const ctx = new OfflineAudioContext(1, length, MODEL_RATE);
  const buffer = ctx.createBuffer(1, Math.max(1, audio.length), rate);
  buffer.getChannelData(0).set(audio);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
  return (await ctx.startRendering()).getChannelData(0);
}
