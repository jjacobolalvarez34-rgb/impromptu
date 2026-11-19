import type { Instrument } from '@impromptu/core';
import { HIHAT_ABIERTO, piezaDeNota } from '@impromptu/core';
import type { Voice } from './sustain';

/**
 * Guitarra, bajo y batería sintetizados (fase 9): no hay que descargar nada ni hay licencias de
 * muestras de por medio. La cuerda es Karplus-Strong (una línea de retardo que se repite y se
 * apaga, como una cuerda pulsada); la batería se arma con barridos de tono y ruido filtrado.
 * Cada sonido se genera una vez por altura y fuerza y queda en caché. Mismo cálculo en la app
 * de Android (`Sintes.kt`).
 */

export type Timbre = 'nylon' | 'acero' | 'electrica' | 'bajo';

/** Ruido determinista (la misma nota suena siempre igual: exportar da lo mismo que escuchar). */
function ruido(semilla: number): () => number {
  let s = semilla >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) / 4294967296) * 2 - 1;
  };
}

/** Cuerda pulsada: Karplus-Strong con retardo fraccionario, brillo según la fuerza y cuerpo. */
export function cuerda(
  pitch: number,
  velocity: number,
  timbre: Timbre,
  tasa: number,
): Float32Array {
  const f = 440 * Math.pow(2, (pitch - 69) / 12);
  const graves = Math.max(0, Math.min(1, (64 - pitch) / 30));
  const seg = { nylon: 2.2, acero: 3.0, electrica: 4.0, bajo: 3.5 }[timbre] * (0.7 + 0.6 * graves);
  const n = Math.ceil(seg * tasa);
  const out = new Float32Array(n);
  // El promedio de dos muestras retrasa media muestra: se descuenta.
  const retardo = tasa / f - 0.5;
  const inicio = Math.ceil(retardo) + 1;
  const brillo = 0.25 + 0.75 * (velocity / 127);
  const azar = ruido(pitch * 131 + velocity);
  // Excitación: ruido suavizado (más suave = pulsada con la yema; más brillante = con púa).
  let previo = 0;
  const suave = { nylon: 0.55, acero: 0.8, electrica: 0.7, bajo: 0.35 }[timbre] * brillo;
  for (let i = 0; i < Math.min(inicio, n); i++) {
    previo += suave * (azar() - previo);
    out[i] = previo;
  }
  // Cuánto se apaga por vuelta para que caiga 60 dB en `seg` segundos.
  const caida = Math.pow(0.001, 1 / Math.max(1, seg * f));
  const leer = (pos: number) => {
    const k = Math.floor(pos);
    const fr = pos - k;
    return out[k]! * (1 - fr) + out[k + 1]! * fr;
  };
  for (let i = inicio; i < n; i++) {
    const d = i - retardo;
    out[i] = caida * 0.5 * (leer(d) + leer(d - 1));
  }
  // Cuerpo: un paso bajo suave (nylon y bajo más redondos) y una entrada sin clic.
  const corte = { nylon: 0.35, acero: 0.55, electrica: 0.6, bajo: 0.25 }[timbre];
  let lp = 0;
  const nivel = 0.5 * (0.35 + 0.65 * (velocity / 127));
  for (let i = 0; i < n; i++) {
    lp += corte * (out[i]! - lp);
    const entrada = Math.min(1, i / (tasa * 0.002));
    const salida = Math.min(1, (n - i) / (tasa * 0.05));
    out[i] = lp * nivel * entrada * salida;
  }
  return out;
}

/** Filtro de un polo (paso bajo) sobre un arreglo, en el lugar. */
function pasoBajo(x: Float32Array, a: number): void {
  let y = 0;
  for (let i = 0; i < x.length; i++) x[i] = y += a * (x[i]! - y);
}

/** Paso alto de un polo, en el lugar. */
function pasoAlto(x: Float32Array, a: number): void {
  let y = 0;
  let prev = 0;
  for (let i = 0; i < x.length; i++) {
    const v = x[i]!;
    y = a * (y + v - prev);
    prev = v;
    x[i] = y;
  }
}

/** Golpe de batería para una nota General MIDI. */
export function golpe(nota: number, velocity: number, tasa: number): Float32Array {
  const pieza = piezaDeNota(nota)?.id ?? 'caja';
  const v = 0.25 + 0.75 * (velocity / 127);
  const azar = ruido(nota * 977 + velocity);
  const dur = (s: number) => new Float32Array(Math.ceil(s * tasa));
  const env = (i: number, tau: number) => Math.exp(-i / (tau * tasa));
  const tono = (
    out: Float32Array,
    f0: number,
    f1: number,
    barrido: number,
    tau: number,
    g: number,
  ) => {
    let fase = 0;
    for (let i = 0; i < out.length; i++) {
      const f = f1 + (f0 - f1) * Math.exp(-i / (barrido * tasa));
      fase += (2 * Math.PI * f) / tasa;
      out[i] = out[i]! + Math.sin(fase) * env(i, tau) * g;
    }
  };
  const ruidoCon = (n: number, tau: number, g: number, alto: number, bajo: number) => {
    const r = dur(n);
    for (let i = 0; i < r.length; i++) r[i] = azar();
    if (alto > 0) pasoAlto(r, alto);
    if (bajo > 0) pasoBajo(r, bajo);
    for (let i = 0; i < r.length; i++) r[i] = r[i]! * env(i, tau) * g;
    return r;
  };
  const metal = (out: Float32Array, base: number, tau: number, g: number) => {
    // Parciales inarmónicos (como un platillo) más ruido agudo.
    const razones = [1, 1.483, 1.932, 2.546, 2.63, 3.897];
    for (const r of razones) {
      let fase = 0;
      for (let i = 0; i < out.length; i++) {
        fase += (2 * Math.PI * base * r) / tasa;
        out[i] = out[i]! + (Math.sin(fase) > 0 ? 1 : -1) * env(i, tau) * g * 0.08;
      }
    }
    pasoAlto(out, 0.85);
  };
  let out: Float32Array;
  switch (pieza) {
    case 'bombo':
      out = dur(0.6);
      tono(out, 160, 48, 0.03, 0.22, 1);
      out.set(ruidoCon(0.006, 0.002, 0.4, 0, 0.5).map((x, i) => x + out[i]!));
      break;
    case 'caja': {
      out = dur(0.45);
      tono(out, 260, 185, 0.01, 0.06, 0.6);
      const r = ruidoCon(0.45, 0.12, 0.8, 0.6, 0.6);
      for (let i = 0; i < out.length; i++) out[i] = out[i]! + r[i]!;
      break;
    }
    case 'tom-agudo':
    case 'tom-medio':
    case 'tom-piso': {
      const f = { 'tom-agudo': 200, 'tom-medio': 150, 'tom-piso': 100 }[pieza];
      out = dur(0.8);
      tono(out, f * 1.5, f, 0.04, 0.3, 0.9);
      break;
    }
    case 'hihat':
    case 'hihat-pie': {
      const abierto = nota === HIHAT_ABIERTO;
      const tau = abierto ? 0.3 : pieza === 'hihat-pie' ? 0.03 : 0.045;
      out = ruidoCon(abierto ? 1.2 : 0.25, tau, pieza === 'hihat-pie' ? 0.35 : 0.6, 0.95, 0);
      metal(out, 2900, tau, 0.6);
      break;
    }
    case 'ride': {
      out = ruidoCon(2.5, 0.9, 0.25, 0.9, 0);
      metal(out, 2200, 1.2, 0.9);
      break;
    }
    default: {
      // Crash y demás platillos.
      out = ruidoCon(3, 1.1, 0.7, 0.85, 0);
      metal(out, 1700, 1.4, 1);
    }
  }
  for (let i = 0; i < out.length; i++) out[i] = out[i]! * v * 0.6;
  return out;
}

/** Timbre por defecto de cada instrumento de cuerda. */
export const TIMBRE_DE: Record<Exclude<Instrument, 'piano' | 'drums'>, Timbre> = {
  guitar: 'acero',
  bass: 'bajo',
};

/**
 * Batería grabada (Sonic Pi, CC0; ver docs/LICENCIAS.md): para cada nota General MIDI, la
 * grabación fuerte y, si hay, la suave.
 */
export const MUESTRAS_BATERIA: Readonly<Record<number, readonly [string, string?]>> = {
  35: ['drum_bass_hard', 'drum_bass_soft'],
  36: ['drum_bass_hard', 'drum_bass_soft'],
  37: ['drum_snare_soft'],
  38: ['drum_snare_hard', 'drum_snare_soft'],
  39: ['drum_snare_hard'],
  40: ['drum_snare_hard', 'drum_snare_soft'],
  41: ['drum_tom_lo_hard', 'drum_tom_lo_soft'],
  43: ['drum_tom_lo_hard', 'drum_tom_lo_soft'],
  42: ['drum_cymbal_closed'],
  44: ['drum_cymbal_pedal'],
  45: ['drum_tom_mid_hard', 'drum_tom_mid_soft'],
  46: ['drum_cymbal_open'],
  47: ['drum_tom_mid_hard', 'drum_tom_mid_soft'],
  48: ['drum_tom_hi_hard', 'drum_tom_hi_soft'],
  49: ['drum_cymbal_hard'],
  50: ['drum_tom_hi_hard', 'drum_tom_hi_soft'],
  51: ['drum_cymbal_soft'],
  52: ['drum_cymbal_hard'],
  53: ['drum_cymbal_soft'],
  55: ['drum_splash_hard'],
  56: ['drum_cowbell'],
  57: ['drum_cymbal_hard'],
  59: ['drum_cymbal_soft'],
};

interface Activa {
  source: AudioBufferSourceNode;
  gain: GainNode;
}

/**
 * Guitarra, bajo y batería con Web Audio: misma forma que `Piano` (programar voces, tocar en
 * vivo y cortar todo), así el estudio y la exportación los usan igual.
 */
export class Sintes {
  private readonly cache = new Map<string, AudioBuffer>();
  private activas: Activa[] = [];
  readonly output: GainNode;
  /** Timbre de la guitarra (se puede cambiar en el estudio). */
  timbreGuitarra: Timbre = 'acero';

  constructor(readonly context: BaseAudioContext) {
    this.output = context.createGain();
    this.output.gain.value = 0.8;
    this.output.connect(context.destination);
  }

  private buffer(instrument: Instrument, pitch: number, velocity: number): AudioBuffer {
    // La fuerza se agrupa de a 16 para reutilizar sonidos.
    const fuerza = Math.min(127, Math.max(1, Math.round(velocity / 16) * 16 || 8));
    const timbre = instrument === 'bass' ? 'bajo' : this.timbreGuitarra;
    const clave = `${instrument}:${timbre}:${pitch}:${fuerza}`;
    let b = this.cache.get(clave);
    if (!b) {
      const tasa = this.context.sampleRate;
      const datos =
        instrument === 'drums' ? golpe(pitch, fuerza, tasa) : cuerda(pitch, fuerza, timbre, tasa);
      b = this.context.createBuffer(1, datos.length, tasa);
      b.copyToChannel(datos as Float32Array<ArrayBuffer>, 0);
      this.cache.set(clave, b);
    }
    return b;
  }

  /** Grabaciones de batería acústica (CC0, de Sonic Pi), por nombre de archivo. */
  private readonly bateria = new Map<string, AudioBuffer>();
  /** Hi-hat abierto sonando: el cerrado o el pie lo cortan, como en una batería real. */
  private hihatAbierto: Activa[] = [];

  /**
   * Descarga y decodifica la batería grabada (unos 800 kB, una vez). Mientras no esté, suena la
   * sintetizada. `base`: carpeta de los .flac (termina en /).
   */
  async cargarBateria(base: string): Promise<void> {
    const nombres = new Set(
      Object.values(MUESTRAS_BATERIA)
        .flat()
        .filter((n): n is string => !!n),
    );
    await Promise.all(
      [...nombres].map(async (n) => {
        if (this.bateria.has(n)) return;
        const res = await fetch(`${base}${n}.flac`);
        if (!res.ok) return;
        this.bateria.set(n, await this.context.decodeAudioData(await res.arrayBuffer()));
      }),
    );
  }

  /** Usa la batería ya decodificada de otro (por ejemplo, para exportar sin volver a descargar). */
  compartirBateria(otro: Sintes): void {
    for (const [n, b] of otro.bateria) this.bateria.set(n, b);
    this.timbreGuitarra = otro.timbreGuitarra;
  }

  /** Grabación para un golpe: la fuerte o la suave según la fuerza. */
  private muestraBateria(nota: number, velocity: number): AudioBuffer | null {
    const par = MUESTRAS_BATERIA[nota];
    if (!par) return null;
    const [fuerte, suave] = par;
    return this.bateria.get(velocity < 64 && suave ? suave : fuerte) ?? null;
  }

  /** Programa una voz: la cuerda se apaga al soltar (con un apagado corto); la batería suena entera. */
  play(voice: Voice, at: number, releaseAt: number, offset = 0): void {
    const instrument = voice.instrument ?? 'guitar';
    const nota = voice.note.pitch;
    const grabada = instrument === 'drums' ? this.muestraBateria(nota, voice.note.velocity) : null;
    const b = grabada ?? this.buffer(instrument, nota, voice.note.velocity);
    if (offset >= b.duration) return;
    const source = this.context.createBufferSource();
    source.buffer = b;
    const gain = this.context.createGain();
    // Las grabaciones tienen dos capas (suave y fuerte); dentro de cada una, la fuerza escala.
    const nivel = grabada
      ? voice.gain * (0.35 + 0.65 * (voice.note.velocity / 127)) * 1.4
      : voice.gain;
    gain.gain.setValueAtTime(nivel, at);
    source.connect(gain).connect(this.output);
    // Primero start: el navegador no deja programar stop antes (era lo que dejaba mudas a la
    // guitarra y el bajo).
    source.start(at, offset);
    if (instrument !== 'drums' && Number.isFinite(releaseAt)) {
      gain.gain.setValueAtTime(nivel, releaseAt);
      gain.gain.setTargetAtTime(0, releaseAt, 0.04);
      source.stop(releaseAt + 0.3);
    }
    const a = { source, gain };
    if (instrument === 'drums' && (nota === 42 || nota === 44)) {
      // El hi-hat cerrado (o el pie) calla al abierto.
      for (const h of this.hihatAbierto) {
        h.gain.gain.setTargetAtTime(0, at, 0.015);
        try {
          h.source.stop(at + 0.1);
        } catch {
          // Ya terminó.
        }
      }
      this.hihatAbierto = [];
    }
    if (instrument === 'drums' && nota === HIHAT_ABIERTO) this.hihatAbierto.push(a);
    this.activas.push(a);
    source.onended = () => {
      this.activas = this.activas.filter((x) => x !== a);
      this.hihatAbierto = this.hihatAbierto.filter((x) => x !== a);
    };
  }

  /** En vivo (batería electrónica, guitarra MIDI). */
  strike(instrument: Instrument, pitch: number, velocity: number): Activa {
    const at = this.context.currentTime;
    const voice: Voice = {
      note: {
        id: '',
        pitch,
        start: 0,
        end: 0,
        velocity,
        hand: null,
        handSource: null,
        finger: null,
        fingerSource: null,
        origin: 'midi-live',
      },
      start: 0,
      release: Infinity,
      gain: 1,
      instrument,
    };
    this.play(voice, at, Infinity);
    return this.activas[this.activas.length - 1]!;
  }

  damp(a: Activa): void {
    const at = this.context.currentTime;
    a.gain.gain.cancelScheduledValues(at);
    a.gain.gain.setTargetAtTime(0, at, 0.04);
    try {
      a.source.stop(at + 0.3);
    } catch {
      // Ya estaba detenida.
    }
  }

  stopAll(): void {
    const now = this.context.currentTime;
    for (const { source } of this.activas) {
      try {
        source.stop(now + 0.02);
      } catch {
        // Ya estaba detenida.
      }
    }
    this.activas = [];
  }
}
