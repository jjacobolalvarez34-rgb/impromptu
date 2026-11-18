/**
 * Batería desde el micrófono o un audio (fase 9). No hay un modelo de IA con licencia que se
 * pueda usar (ver docs/LICENCIAS.md), así que es un detector propio: se mide la energía en tres
 * bandas (graves, medios y agudos), se buscan golpes en cada banda por separado (un bombo y un
 * hi-hat juntos son dos golpes) y se clasifica cada uno por su banda y por cuánto dura. Funciona
 * mejor con la batería sola. Mismo cálculo en la app de Android (`DetectorBateria.kt`).
 */

export interface Golpe {
  /** Nota General MIDI (36 bombo, 38 caja, 42 hi-hat, 46 hi-hat abierto, 49 crash, 51 ride, 43/47/50 toms). */
  nota: number;
  tiempo: number;
  fuerza: number;
}

const VENTANA = 1024;
const SALTO = 256;

/** FFT radix-2 en el lugar. */
function fft(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j]!, re[i]!];
      [im[i], im[j]] = [im[j]!, im[i]!];
    }
  }
  for (let size = 2; size <= n; size <<= 1) {
    const half = size >> 1;
    const ang = (-2 * Math.PI) / size;
    for (let start = 0; start < n; start += size) {
      for (let k = 0; k < half; k++) {
        const c = Math.cos(ang * k);
        const s = Math.sin(ang * k);
        const a = start + k;
        const b = a + half;
        const tr = re[b]! * c - im[b]! * s;
        const ti = re[b]! * s + im[b]! * c;
        re[b] = re[a]! - tr;
        im[b] = im[a]! - ti;
        re[a] = re[a]! + tr;
        im[a] = im[a]! + ti;
      }
    }
  }
}

interface Bandas {
  /** Energía (log) por cuadro en cada banda. */
  graves: Float64Array;
  medios: Float64Array;
  agudos: Float64Array;
  /** Frecuencia promedio (Hz) de cada cuadro. */
  centroide: Float64Array;
  cuadros: number;
}

function bandas(x: Float32Array, tasa: number): Bandas {
  const cuadros = Math.max(0, Math.floor((x.length - VENTANA) / SALTO) + 1);
  const graves = new Float64Array(cuadros);
  const medios = new Float64Array(cuadros);
  const agudos = new Float64Array(cuadros);
  const centroide = new Float64Array(cuadros);
  const hann = Float64Array.from(
    { length: VENTANA },
    (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / VENTANA),
  );
  const re = new Float64Array(VENTANA);
  const im = new Float64Array(VENTANA);
  const hz = tasa / VENTANA;
  for (let c = 0; c < cuadros; c++) {
    for (let i = 0; i < VENTANA; i++) {
      re[i] = x[c * SALTO + i]! * hann[i]!;
      im[i] = 0;
    }
    fft(re, im);
    let g = 0;
    let m = 0;
    let a = 0;
    let suma = 0;
    let pond = 0;
    for (let k = 1; k < VENTANA / 2; k++) {
      const p = re[k]! * re[k]! + im[k]! * im[k]!;
      const f = k * hz;
      if (f < 150) g += p;
      else if (f < 2500) m += p;
      else a += p;
      suma += p;
      pond += p * f;
    }
    graves[c] = Math.log10(1e-9 + g);
    medios[c] = Math.log10(1e-9 + m);
    agudos[c] = Math.log10(1e-9 + a);
    centroide[c] = suma > 0 ? pond / suma : 0;
  }
  return { graves, medios, agudos, centroide, cuadros };
}

/** Picos de subida de energía (flujo) por encima de un umbral que se adapta al entorno. */
function golpesEnBanda(
  e: Float64Array,
  tasa: number,
  sensibilidad: number,
): { cuadro: number; fuerza: number }[] {
  const n = e.length;
  const flujo = new Float64Array(n);
  for (let i = 1; i < n; i++)
    flujo[i] = Math.max(0, e[i]! - e[i - 1]!) + Math.max(0, (e[i + 1] ?? e[i]!) - e[i - 1]!) * 0.5;
  const out: { cuadro: number; fuerza: number }[] = [];
  const radio = Math.round((0.15 * tasa) / SALTO);
  const separacion = Math.round((0.05 * tasa) / SALTO);
  const maximo = flujo.reduce((m, v) => Math.max(m, v), 0);
  // Piso: lo que está 30 dB por debajo de lo más fuerte de la banda es ruido o la cola de otro golpe.
  const piso = e.reduce((m, v) => Math.max(m, v), -Infinity) - 3;
  for (let i = 1; i < n - 1; i++) {
    const v = flujo[i]!;
    if (v < flujo[i - 1]! || v < flujo[i + 1]!) continue;
    if (Math.max(e[i]!, e[i + 1]!) < piso) continue;
    let suma = 0;
    let cuenta = 0;
    for (let j = Math.max(0, i - radio); j < Math.min(n, i + radio); j++) {
      suma += flujo[j]!;
      cuenta++;
    }
    const umbral = (suma / cuenta) * 1.6 + 0.12 * sensibilidad + maximo * 0.06;
    if (v < umbral) continue;
    const ultimo = out[out.length - 1];
    if (ultimo && i - ultimo.cuadro < separacion) {
      if (v > ultimo.fuerza) out[out.length - 1] = { cuadro: i, fuerza: v };
      continue;
    }
    out.push({ cuadro: i, fuerza: v });
  }
  return out;
}

/** Cuánto tarda la energía de una banda en bajar 12 dB después del golpe (s). */
function caida(e: Float64Array, desde: number, tasa: number): number {
  const pico = Math.max(e[desde]!, e[desde + 1] ?? -Infinity, e[desde + 2] ?? -Infinity);
  let i = desde;
  while (i < e.length && e[i]! > pico - 1.2) i++;
  return ((i - desde) * SALTO) / tasa;
}

/** Detecta los golpes de batería de un audio mono. */
export function detectarBateria(x: Float32Array, tasa: number, sensibilidad = 1): Golpe[] {
  const b = bandas(x, tasa);
  const golpes: Golpe[] = [];
  const t = (cuadro: number) => (cuadro * SALTO + VENTANA / 4) / tasa;
  const fuerza = (f: number, max: number) =>
    Math.round(Math.min(127, Math.max(20, 30 + (97 * f) / Math.max(1e-6, max))));
  const g = golpesEnBanda(b.graves, tasa, sensibilidad);
  const m = golpesEnBanda(b.medios, tasa, sensibilidad);
  const a = golpesEnBanda(b.agudos, tasa, sensibilidad);
  const maxG = g.reduce((s, x) => Math.max(s, x.fuerza), 0);
  const maxM = m.reduce((s, x) => Math.max(s, x.fuerza), 0);
  const maxA = a.reduce((s, x) => Math.max(s, x.fuerza), 0);
  const cerca = (lista: { cuadro: number }[], c: number, r = 3) =>
    lista.some((x) => Math.abs(x.cuadro - c) <= r);

  const pico = (e: Float64Array, c: number) =>
    Math.max(e[c]!, e[c + 1] ?? -Infinity, e[c + 2] ?? -Infinity);

  // Graves: bombo (un tom fuerte en medios sale por la rama de medios).
  for (const o of g) {
    if (pico(b.medios, o.cuadro) > pico(b.graves, o.cuadro) + 0.3) continue;
    golpes.push({ nota: 36, tiempo: t(o.cuadro), fuerza: fuerza(o.fuerza, maxG) });
  }
  // Medios: caja (con ruido brillante) o tom (más grave y con más cuerpo).
  for (const o of m) {
    if (cerca(g, o.cuadro) && pico(b.medios, o.cuadro) < pico(b.graves, o.cuadro)) continue; // bombo
    // Mucho más agudo que medio: es un platillo o el hi-hat (sale por la rama de agudos).
    if (pico(b.agudos, o.cuadro) > pico(b.medios, o.cuadro) + 0.5) continue;
    const brillante =
      cerca(a, o.cuadro) && pico(b.agudos, o.cuadro) > pico(b.medios, o.cuadro) - 1.5;
    const nota = brillante ? 38 : b.centroide[o.cuadro]! > 400 ? 50 : 47;
    golpes.push({ nota, tiempo: t(o.cuadro), fuerza: fuerza(o.fuerza, maxM) });
  }
  // Agudos: hi-hat (corto), hi-hat abierto, ride o crash (largos).
  for (const o of a) {
    // Con un golpe en medios al lado y sin dominar los agudos, es el ruido de la caja.
    if (cerca(m, o.cuadro, 2) && pico(b.agudos, o.cuadro) < pico(b.medios, o.cuadro) + 0.5)
      continue;
    const dura = caida(b.agudos, o.cuadro, tasa);
    const nota = dura < 0.12 ? 42 : dura < 0.45 ? 46 : o.fuerza > maxA * 0.6 ? 49 : 51;
    golpes.push({ nota, tiempo: t(o.cuadro), fuerza: fuerza(o.fuerza, maxA) });
  }
  return golpes.sort((p, q) => p.tiempo - q.tiempo || p.nota - q.nota);
}
