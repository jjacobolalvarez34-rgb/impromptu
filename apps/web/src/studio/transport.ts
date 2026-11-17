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

  private readonly listeners = new Set<() => void>();

  constructor(private clock: () => number = () => performance.now() / 1000) {}

  /** Avisa de play, pausa, búsqueda, velocidad o cambio de reloj (para reprogramar el audio). */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    for (const l of this.listeners) l();
  }

  /** Cambia el reloj base (por ejemplo, al del AudioContext) sin saltar de posición. */
  setClock(clock: () => number): void {
    const t = this.now();
    this.clock = clock;
    this.anchorTime = t;
    this.anchorClock = clock();
    this.emit();
  }

  /** Valor del reloj base en que sonará el segundo `songTime` de la toma (si sigue sonando). */
  toClock(songTime: number): number {
    return this.anchorClock + (songTime - this.anchorTime) / this._speed;
  }

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
      // Llegó al final: se detiene aquí mismo. (Llamar a pause() desde now() volvía a
      // llamar a now() sin fin y congelaba el visualizador mientras el audio seguía.)
      this._playing = false;
      this.anchorTime = this.duration;
      this.anchorClock = this.clock();
      this.emit();
      return this.duration;
    }
    return t;
  }

  play(): void {
    if (this._playing) return;
    if (this.anchorTime >= this.duration) this.anchorTime = this.loop?.start ?? 0;
    this.anchorClock = this.clock();
    this._playing = true;
    this.emit();
  }

  pause(): void {
    if (!this._playing) return;
    this.anchorTime = this.now();
    this._playing = false;
    this.emit();
  }

  seek(t: number): void {
    this.anchorTime = Math.min(Math.max(0, t), this.duration);
    this.anchorClock = this.clock();
    this.emit();
  }

  setSpeed(speed: number): void {
    const t = this.now();
    this._speed = Math.min(1.5, Math.max(0.5, speed));
    this.anchorTime = t;
    this.anchorClock = this.clock();
    this.emit();
  }

  /** La repetición saltó al inicio de la sección: el audio debe reprogramarse. */
  private lastNow = 0;
  wrapped(t: number): boolean {
    const jumped = t < this.lastNow - 0.05;
    this.lastNow = t;
    return jumped;
  }
}

/** 84.36 → "01:24.36" (formato del LCD). */
export function formatTime(seconds: number): string {
  const s = Math.max(0, seconds);
  const min = Math.floor(s / 60);
  const sec = s - min * 60;
  return `${String(min).padStart(2, '0')}:${sec.toFixed(2).padStart(5, '0')}`;
}
