/**
 * Reloj de reproducción: convierte el reloj del sistema en segundos de la toma,
 * con velocidad (0,5×–1,5×) y repetición de sección. Todo el estudio lee el tiempo
 * de aquí; cuando llegue el audio, el reloj base pasa a ser el del AudioContext.
 */
export interface LoopRange {
  start: number;
  end: number;
}

export class Transport {
  private anchorClock = 0; // segundos del reloj base al reanudar
  private anchorTime = 0; // segundos de la toma al reanudar
  private _playing = false;
  private _speed = 1;
  duration = 0;
  loop: LoopRange | null = null;

  constructor(private readonly clock: () => number = () => performance.now() / 1000) {}

  get playing(): boolean {
    return this._playing;
  }

  get speed(): number {
    return this._speed;
  }

  /** Segundos de la toma en este instante. Aplica la repetición y se detiene al final. */
  now(): number {
    if (!this._playing) return this.anchorTime;
    let t = this.anchorTime + (this.clock() - this.anchorClock) * this._speed;
    if (this.loop && t >= this.loop.end && this.loop.end > this.loop.start) {
      const len = this.loop.end - this.loop.start;
      t = this.loop.start + ((t - this.loop.start) % len);
    } else if (t >= this.duration) {
      this.pause();
      this.seek(this.duration);
      return this.duration;
    }
    return t;
  }

  play(): void {
    if (this._playing) return;
    if (this.anchorTime >= this.duration) this.anchorTime = this.loop?.start ?? 0;
    this.anchorClock = this.clock();
    this._playing = true;
  }

  pause(): void {
    if (!this._playing) return;
    this.anchorTime = this.now();
    this._playing = false;
  }

  seek(t: number): void {
    this.anchorTime = Math.min(Math.max(0, t), this.duration);
    this.anchorClock = this.clock();
  }

  setSpeed(speed: number): void {
    const t = this.now();
    this._speed = Math.min(1.5, Math.max(0.5, speed));
    this.anchorTime = t;
    this.anchorClock = this.clock();
  }
}

/** 84.36 → "01:24.36" (formato del LCD). */
export function formatTime(seconds: number): string {
  const s = Math.max(0, seconds);
  const min = Math.floor(s / 60);
  const sec = s - min * 60;
  return `${String(min).padStart(2, '0')}:${sec.toFixed(2).padStart(5, '0')}`;
}
