import type { PedalKind } from '@impromptu/core';
import { isPedalDown } from '@impromptu/core';

/** Lo mínimo que necesita el modo en vivo de un piano (el real o uno de prueba). */
export interface Strikeable<H> {
  strike(pitch: number, velocity: number, gainScale?: number): H | null;
  damp(voice: H, quick?: boolean): void;
}

const SOFT_GAIN = 0.72;

/**
 * Pedales en vivo, como en un piano: el sustain retiene los apagadores, el sostenuto
 * solo para las teclas que estaban abajo al pisarlo, la una corda suaviza lo que se
 * toque mientras está pisada y repetir una tecla apaga la nota anterior.
 */
export class LivePlayer<H> {
  private readonly voices = new Map<number, H>();
  private readonly keysDown = new Set<number>();
  private readonly sostenutoHeld = new Set<number>();
  private sustain = false;
  private sostenuto = false;
  private soft = false;

  constructor(private readonly piano: Strikeable<H>) {}

  noteOn(pitch: number, velocity: number): void {
    const previous = this.voices.get(pitch);
    if (previous !== undefined) this.piano.damp(previous, true);
    const voice = this.piano.strike(pitch, velocity, this.soft ? SOFT_GAIN : 1);
    if (voice === null) this.voices.delete(pitch);
    else this.voices.set(pitch, voice);
    this.keysDown.add(pitch);
  }

  noteOff(pitch: number): void {
    this.keysDown.delete(pitch);
    if (!this.held(pitch)) this.release(pitch);
  }

  pedal(kind: PedalKind, value: number): void {
    const down = isPedalDown(value);
    if (kind === 'soft') {
      this.soft = down;
      return;
    }
    if (kind === 'sostenuto') {
      if (down && !this.sostenuto) for (const p of this.keysDown) this.sostenutoHeld.add(p);
      if (!down) {
        const caught = [...this.sostenutoHeld];
        this.sostenutoHeld.clear();
        for (const p of caught) if (!this.held(p)) this.release(p);
      }
      this.sostenuto = down;
      return;
    }
    this.sustain = down;
    if (!down) for (const p of [...this.voices.keys()]) if (!this.held(p)) this.release(p);
  }

  /** Apaga todo (desconectar, cambiar de modo). */
  reset(): void {
    for (const v of this.voices.values()) this.piano.damp(v, true);
    this.voices.clear();
    this.keysDown.clear();
    this.sostenutoHeld.clear();
    this.sustain = this.sostenuto = this.soft = false;
  }

  private held(pitch: number): boolean {
    return this.keysDown.has(pitch) || this.sustain || this.sostenutoHeld.has(pitch);
  }

  private release(pitch: number): void {
    const voice = this.voices.get(pitch);
    if (voice === undefined) return;
    this.piano.damp(voice);
    this.voices.delete(pitch);
  }
}
