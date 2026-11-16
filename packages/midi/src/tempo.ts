import type { MidiData } from 'midi-file';

const DEFAULT_US_PER_BEAT = 500_000; // 120 bpm, el valor por defecto de MIDI

interface Segment {
  tick: number;
  seconds: number;
  secondsPerTick: number;
}

/**
 * Devuelve una función ticks → segundos que respeta todos los cambios de tempo
 * (de cualquier pista, como pide el formato 1) o la división SMPTE.
 */
export function createTempoMap(data: MidiData): (tick: number) => number {
  const { ticksPerBeat, framesPerSecond, ticksPerFrame } = data.header;
  if (!ticksPerBeat && framesPerSecond && ticksPerFrame) {
    const spt = 1 / (framesPerSecond * ticksPerFrame);
    return (tick) => tick * spt;
  }
  const ppq = ticksPerBeat ?? 480;

  const changes: { tick: number; usPerBeat: number }[] = [];
  for (const events of data.tracks) {
    let tick = 0;
    for (const e of events) {
      tick += e.deltaTime;
      if (e.type === 'setTempo') changes.push({ tick, usPerBeat: e.microsecondsPerBeat });
    }
  }
  changes.sort((a, b) => a.tick - b.tick);

  const segments: Segment[] = [
    { tick: 0, seconds: 0, secondsPerTick: DEFAULT_US_PER_BEAT / 1e6 / ppq },
  ];
  for (const c of changes) {
    const last = segments[segments.length - 1]!;
    const seconds = last.seconds + (c.tick - last.tick) * last.secondsPerTick;
    const segment = { tick: c.tick, seconds, secondsPerTick: c.usPerBeat / 1e6 / ppq };
    if (c.tick === last.tick) segments[segments.length - 1] = segment;
    else segments.push(segment);
  }

  return (tick) => {
    // Búsqueda binaria del último segmento que empieza en o antes de `tick`.
    let lo = 0;
    let hi = segments.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (segments[mid]!.tick <= tick) lo = mid;
      else hi = mid - 1;
    }
    const s = segments[lo]!;
    return s.seconds + (tick - s.tick) * s.secondsPerTick;
  };
}
