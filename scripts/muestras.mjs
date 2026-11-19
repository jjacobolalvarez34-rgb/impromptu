// Arma los sonidos grabados de guitarra, bajo y batería (pedido 25 de Jacobo) a partir de los
// bancos SFZ originales (descargados en D:/.cache/muestras, ver docs/LICENCIAS.md):
//   - Guitarra nylon: FreePats Spanish Classical Guitar (CC0)
//   - Guitarra acero: FreePats FSS Steel String Guitar (GPL-3.0+ con excepción de FreePats)
//   - Guitarra eléctrica: FreePats FSBS Electric Guitar Clean (CC0)
//   - Bajo: FreePats Electric Bass YR, dedos (CC0)
//   - Batería: MuldjordKit de Lars Muldjord, versión FreePats (CC-BY 4.0)
//
// De cada banco se toma un subconjunto (una nota cada 3 semitonos, hasta 2 capas de fuerza en
// las cuerdas; 3 capas y 2 variaciones en la batería), recortado con fundido y comprimido en
// FLAC de 16 bits. Sale en apps/web/public/instrumentos/<nombre>/ con un `manifiesto.json`.
// La app de Android copia la misma carpeta a sus assets.
//
// Uso: node scripts/muestras.mjs   (necesita ffmpeg en el PATH)

import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ORIGEN = process.env.MUESTRAS ?? 'D:/.cache/muestras';
const DESTINO = path.resolve('apps/web/public/instrumentos');

/** Lee un SFZ sencillo: cada región con las opciones heredadas de <global> y <group>. */
function leerSfz(archivo) {
  const texto = fs.readFileSync(archivo, 'utf8');
  /** Cada región guarda las tres capas de opciones; se mezclan al final. */
  const regiones = [];
  let global = {};
  let grupo = {};
  let actual = null;
  let seccion = null;
  for (const linea of texto.split(/\r?\n/)) {
    const sinComentario = linea.replace(/\/\/.*$/, '').trim();
    if (!sinComentario) continue;
    for (const pieza of sinComentario.split(/(?=<\w+>)/)) {
      const cabecera = pieza.match(/^<(\w+)>/);
      if (cabecera) {
        seccion = cabecera[1];
        if (seccion === 'global') global = {};
        if (seccion === 'group') grupo = {};
        if (seccion === 'region') {
          actual = {};
          regiones.push({ global, grupo, region: actual });
        }
      }
      const destino = seccion === 'global' ? global : seccion === 'group' ? grupo : actual;
      if (!destino) continue;
      // `sample=` puede tener espacios hasta el final de la línea.
      const muestra = pieza.match(/sample=(.+?)\s*$/);
      const resto = muestra ? pieza.slice(0, muestra.index) : pieza;
      for (const [, k, v] of resto.matchAll(/(\w+)=(\S+)/g)) destino[k] = v;
      if (muestra) destino.sample = muestra[1];
    }
  }
  return regiones.map(({ global: g, grupo: gr, region: r }) =>
    normalizar({ ...g, ...gr, ...r }, path.dirname(archivo)),
  );
}

function normalizar(r, carpeta) {
  const n = (v, d) => (v === undefined ? d : Number(v));
  const key = r.key === undefined ? undefined : Number(r.key);
  return {
    lokey: n(r.lokey, key ?? 0),
    hikey: n(r.hikey, key ?? 127),
    centro: n(r.pitch_keycenter, key ?? 60),
    lovel: n(r.lovel, 0),
    hivel: n(r.hivel, 127),
    lorand: n(r.lorand, 0),
    archivo: path.join(carpeta, r.sample.replaceAll('\\', '/')),
  };
}

/** Recorta, funde, pasa a mono o estéreo y comprime en FLAC de 16 bits. */
function convertir(entrada, salida, { duracion, tasa, canales }) {
  const fundido = Math.min(0.3, duracion / 4);
  execFileSync('ffmpeg', [
    '-y',
    '-v',
    'error',
    '-i',
    entrada,
    '-t',
    String(duracion),
    '-af',
    `afade=t=out:st=${duracion - fundido}:d=${fundido}`,
    '-ac',
    String(canales),
    '-ar',
    String(tasa),
    '-sample_fmt',
    's16',
    '-compression_level',
    '8',
    salida,
  ]);
}

/** Pico de un archivo en dB (ffmpeg lo escribe por stderr con volumedetect). */
function pico(archivo) {
  const r = spawnSync(
    'ffmpeg',
    ['-hide_banner', '-i', archivo, '-af', 'volumedetect', '-f', 'null', '-'],
    {
      encoding: 'utf8',
    },
  );
  const m = (r.stderr ?? '').match(/max_volume: (-?[0-9.]+) dB/);
  return m ? Number(m[1]) : -99;
}

const nombreNota = (p) =>
  ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'][p % 12] +
  (Math.floor(p / 12) - 1);

/** Cuerdas: una nota cada `paso` semitonos (3 por defecto) y hasta 2 capas de fuerza (la primera variación). */
function cuerdas({ nombre, sfz, desde, hasta, duracion, tasa, licencia, autor, paso = 3 }) {
  const regiones = leerSfz(sfz);
  const carpeta = path.join(DESTINO, nombre);
  fs.rmSync(carpeta, { recursive: true, force: true });
  fs.mkdirSync(carpeta, { recursive: true });
  const zonas = [];
  const centros = [...new Set(regiones.map((r) => r.centro))].sort((a, b) => a - b);
  const elegidos = [];
  for (let p = desde; p <= hasta; p += paso) {
    const c = centros.reduce((a, b) => (Math.abs(b - p) < Math.abs(a - p) ? b : a));
    if (!elegidos.includes(c)) elegidos.push(c);
  }
  let maximo = -99;
  for (const c of elegidos) {
    // Capas de fuerza de esa nota (con la primera variación de cada una).
    const capas = new Map();
    for (const r of regiones.filter((r) => r.centro === c && r.lorand === 0)) {
      if (!capas.has(r.hivel)) capas.set(r.hivel, r);
    }
    const ordenadas = [...capas.values()].sort((a, b) => a.hivel - b.hivel);
    // Hasta 2: la suave (la más baja) y la fuerte (la más alta).
    const usadas =
      ordenadas.length > 2 ? [ordenadas[0], ordenadas[ordenadas.length - 1]] : ordenadas;
    usadas.forEach((r, i) => {
      const archivo = `${nombreNota(c)}${usadas.length > 1 ? (i === 0 ? '-suave' : '-fuerte') : ''}.flac`;
      convertir(r.archivo, path.join(carpeta, archivo), { duracion, tasa, canales: 1 });
      const db = pico(path.join(carpeta, archivo));
      maximo = Math.max(maximo, db);
      zonas.push({ nota: c, hastaFuerza: i === usadas.length - 1 ? 127 : r.hivel, archivo });
    });
  }
  const manifiesto = {
    nombre,
    autor,
    licencia,
    tasa,
    ganancia: Math.pow(10, (-3 - maximo) / 20),
    zonas,
  };
  fs.writeFileSync(
    path.join(carpeta, 'manifiesto.json'),
    JSON.stringify(manifiesto, null, 1) + '\n',
  );
  return manifiesto;
}

/** Batería: nota General MIDI → pieza del kit (nota del SFZ de MuldjordKit) y su duración. */
const BATERIA = {
  35: [49, 1.0], // bombo (derecho)
  36: [48, 1.0], // bombo
  37: [65, 0.8], // golpe en el aro (caja con la baqueta apoyada)
  38: [50, 1.2], // caja
  39: [51, 1.2], // palmas → la otra caja
  40: [51, 1.2], // caja eléctrica → la otra caja
  41: [64, 2.0], // tom de piso bajo
  43: [64, 2.0], // tom de piso alto
  45: [63, 2.0], // tom bajo
  47: [62, 2.0], // tom medio bajo
  48: [62, 2.0], // tom medio alto
  50: [61, 2.0], // tom alto
  42: [52, 0.6], // hi-hat cerrado
  44: [52, 0.5], // hi-hat con el pie (cerrado y suave)
  46: [53, 2.5], // hi-hat abierto
  49: [58, 4.0], // crash 1
  57: [59, 4.0], // crash 2
  55: [59, 3.0], // splash → crash 2
  52: [60, 4.0], // china
  51: [54, 3.0], // ride 1
  59: [56, 3.0], // ride 2
  53: [55, 3.0], // campana del ride
};
/** Fuerzas en las que se toma una capa (suave, media, fuerte). */
const CAPAS_BATERIA = [45, 85, 120];

function bateria({ sfz, tasa, licencia, autor }) {
  const regiones = leerSfz(sfz);
  const nombre = 'bateria';
  const carpeta = path.join(DESTINO, nombre);
  fs.rmSync(carpeta, { recursive: true, force: true });
  fs.mkdirSync(carpeta, { recursive: true });
  const hechos = new Map(); // archivo original → nombre convertido (se comparten entre notas)
  const piezas = {};
  let maximo = -99;
  for (const [gm, [clave, duracion]] of Object.entries(BATERIA)) {
    const capas = [];
    for (const fuerza of CAPAS_BATERIA) {
      const enCapa = regiones
        .filter(
          (r) => r.lokey <= clave && clave <= r.hikey && r.lovel <= fuerza && fuerza <= r.hivel,
        )
        .sort((a, b) => a.lorand - b.lorand);
      if (enCapa.length === 0) continue;
      // Dos variaciones (round robin) para que los golpes seguidos no suenen a máquina.
      const variaciones = [enCapa[0], enCapa[Math.floor(enCapa.length / 2)]].filter(
        (r, i, a) => a.findIndex((x) => x.archivo === r.archivo) === i,
      );
      const archivos = variaciones.map((r) => {
        const clave2 = `${r.archivo}|${duracion}`;
        if (!hechos.has(clave2)) {
          // Con la carpeta de la pieza: Snare1 y Snare2 tienen archivos con el mismo nombre.
          const base = `${path.basename(path.dirname(r.archivo))}-${path.basename(r.archivo, path.extname(r.archivo)).replace(/-.*$/, '')}`;
          const salida = `${base}${duracion < 1 ? '-c' : ''}.flac`;
          convertir(r.archivo, path.join(carpeta, salida), { duracion, tasa, canales: 2 });
          maximo = Math.max(maximo, pico(path.join(carpeta, salida)));
          hechos.set(clave2, salida);
        }
        return hechos.get(clave2);
      });
      const hasta =
        fuerza === CAPAS_BATERIA[CAPAS_BATERIA.length - 1]
          ? 127
          : Math.round((fuerza + CAPAS_BATERIA[CAPAS_BATERIA.indexOf(fuerza) + 1]) / 2);
      // Dos capas iguales seguidas (pocas grabaciones): se juntan.
      const previa = capas[capas.length - 1];
      if (previa && previa.archivos.join() === archivos.join()) previa.hastaFuerza = hasta;
      else capas.push({ hastaFuerza: hasta, archivos });
    }
    piezas[gm] = capas;
  }
  const manifiesto = {
    nombre,
    autor,
    licencia,
    tasa,
    ganancia: Math.pow(10, (-1 - maximo) / 20),
    piezas,
  };
  fs.writeFileSync(
    path.join(carpeta, 'manifiesto.json'),
    JSON.stringify(manifiesto, null, 1) + '\n',
  );
  return manifiesto;
}

const buscar = (carpeta, patron) => {
  const dir = path.join(ORIGEN, carpeta);
  const pila = [dir];
  while (pila.length) {
    const d = pila.pop();
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const f = path.join(d, e.name);
      if (e.isDirectory()) pila.push(f);
      else if (patron.test(e.name)) return f;
    }
  }
  throw new Error(`No encontré ${patron} en ${dir}`);
};

const resumen = [];
resumen.push(
  cuerdas({
    nombre: 'nylon',
    sfz: buscar('guitarra-nylon', /^SpanishClassicalGuitar.*\.sfz$/),
    desde: 40,
    hasta: 88,
    duracion: 4,
    tasa: 32000,
    licencia: 'CC0 1.0',
    autor: 'FreePats (Spanish Classical Guitar)',
  }),
  cuerdas({
    nombre: 'acero',
    sfz: buscar('guitarra-acero', /^FSS-SteelStringGuitar-\d+\.sfz$/),
    desde: 40,
    hasta: 88,
    duracion: 4,
    tasa: 32000,
    licencia: 'GPL-3.0-or-later con excepción de FreePats',
    autor: 'FreePats (FSS Steel String Guitar, muestras de FlameStudios)',
  }),
  cuerdas({
    nombre: 'electrica',
    sfz: buscar('guitarra-electrica', /^EGuitarFSBS-clean bridge \d+\.sfz$/),
    desde: 40,
    hasta: 88,
    duracion: 4,
    tasa: 32000,
    licencia: 'CC0 1.0',
    autor: 'FreePats (FSBS Electric Guitar, clean)',
  }),
  cuerdas({
    nombre: 'bajo',
    sfz: buscar('bajo', /^FingerBassYR.*\.sfz$/),
    // El banco del bajo trae una sola octava (Mi1 a Re#2): se usan todas.
    desde: 28,
    hasta: 39,
    duracion: 3,
    tasa: 24000,
    paso: 1,
    licencia: 'CC0 1.0',
    autor: 'FreePats (Electric Bass YR, Andrea Biasior)',
  }),
  bateria({
    sfz: buscar('bateria', /^MuldjordKit.*\.sfz$/),
    tasa: 32000,
    licencia: 'CC-BY 4.0',
    autor: 'Lars Muldjord (MuldjordKit, versión de FreePats)',
  }),
);
for (const m of resumen) {
  const carpeta = path.join(DESTINO, m.nombre);
  const peso = fs
    .readdirSync(carpeta)
    .reduce((s, f) => s + fs.statSync(path.join(carpeta, f)).size, 0);
  console.log(
    `${m.nombre}: ${fs.readdirSync(carpeta).length - 1} archivos, ${(peso / 1e6).toFixed(2)} MB, ganancia ${m.ganancia.toFixed(2)}`,
  );
}
