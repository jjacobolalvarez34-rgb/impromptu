import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Metrónomo al grabar con el teclado (fase 6): con clic, la toma guarda su tempo y su compás
 * exactos y la partitura sale con la cuadrícula correcta, aunque se toque con rubato.
 */
interface MetronomeState {
  on: boolean;
  bpm: number;
  /** Pulsos por compás (negras): 2, 3 o 4. */
  beats: number;
  set: (patch: Partial<Pick<MetronomeState, 'on' | 'bpm' | 'beats'>>) => void;
}

export const useMetronome = create<MetronomeState>()(
  persist(
    (set) => ({
      on: false,
      bpm: 90,
      beats: 4,
      set: (patch) => set(patch),
    }),
    {
      name: 'impromptu-metronomo',
      partialize: (s) => ({ on: s.on, bpm: s.bpm, beats: s.beats }),
    },
  ),
);

const LOOKAHEAD = 0.12; // s
const TICK_MS = 25;

/** Clics programados en el reloj del AudioContext (precisos aunque el hilo esté ocupado). */
export class Clicker {
  private timer = 0;
  private next = 0;
  private beat = 0;

  start(context: AudioContext, at: number, bpm: number, beatsPerBar: number): void {
    this.stop();
    this.next = at;
    this.beat = 0;
    const step = 60 / bpm;
    const tick = () => {
      while (this.next < context.currentTime + LOOKAHEAD) {
        click(context, this.next, this.beat % beatsPerBar === 0);
        this.next += step;
        this.beat++;
      }
    };
    tick();
    this.timer = window.setInterval(tick, TICK_MS);
  }

  stop(): void {
    window.clearInterval(this.timer);
    this.timer = 0;
  }
}

/** Un clic corto: más agudo y fuerte en el primer pulso del compás. */
function click(context: AudioContext, at: number, accent: boolean): void {
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.frequency.value = accent ? 1760 : 1175;
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(accent ? 0.45 : 0.3, at + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.001, at + 0.05);
  osc.connect(gain).connect(context.destination);
  osc.start(at);
  osc.stop(at + 0.06);
}
