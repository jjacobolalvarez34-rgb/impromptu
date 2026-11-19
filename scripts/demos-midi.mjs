// Genera los MIDIs de prueba de guitarra, bajo y batería (fase 9) en fixtures/demos.
// Son piezas propias, escritas aquí: se pueden publicar sin problema. Uso: node scripts/demos-midi.mjs
import { mkdirSync, writeFileSync } from 'node:fs';

const PPQ = 480;
const vlq = (n) => {
  const b = [n & 0x7f];
  while ((n >>= 7)) b.unshift((n & 0x7f) | 0x80);
  return b;
};

/** `notas`: [altura, inicio (negras), duración (negras), fuerza]. */
function midi({ nombre, canal, programa, bpm, notas }) {
  const us = Math.round(60_000_000 / bpm);
  const ev = [0x00, 0xff, 0x03, nombre.length, ...Buffer.from(nombre, 'latin1')];
  ev.push(0x00, 0xff, 0x51, 0x03, (us >> 16) & 0xff, (us >> 8) & 0xff, us & 0xff);
  ev.push(0x00, 0xff, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08);
  ev.push(0x00, 0xc0 | canal, programa);
  const todos = [];
  for (const [p, t, d, v] of notas) {
    const a = Math.round(t * PPQ);
    todos.push([a, 1, p, v]);
    todos.push([a + Math.max(1, Math.round(d * PPQ)), 0, p, 0]);
  }
  todos.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  let ultimo = 0;
  for (const [t, on, p, v] of todos) {
    ev.push(...vlq(t - ultimo), (on ? 0x90 : 0x80) | canal, p, v);
    ultimo = t;
  }
  ev.push(0x00, 0xff, 0x2f, 0x00);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(ev.length);
  const cab = Buffer.from([0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, PPQ >> 8, PPQ & 0xff]);
  return Buffer.concat([cab, Buffer.from('MTrk'), len, Buffer.from(ev)]);
}

// Guitarra: arpegios de La menor, Fa, Do y Sol (dos compases cada uno) y al final un rasgueo.
const acordes = {
  Am: [45, 52, 57, 60, 64],
  F: [41, 48, 53, 57, 60, 65],
  C: [48, 52, 55, 60, 64],
  G: [43, 47, 50, 55, 59, 67],
};
const guitarra = [];
let t = 0;
for (const nombre of ['Am', 'F', 'C', 'G', 'Am', 'F', 'C', 'G']) {
  const a = acordes[nombre];
  const patron = [0, 2, 3, 4, 3, 2, 1, 2];
  for (let i = 0; i < 8; i++)
    guitarra.push([a[patron[i] % a.length], t + i * 0.5, 0.9, 70 + (i === 0 ? 25 : 0)]);
  t += 4;
}
for (const nombre of ['Am', 'F', 'C', 'G']) {
  for (const golpe of [0, 1, 1.5, 2.5, 3]) {
    // Rasgueo: las cuerdas una tras otra, muy seguidas; en el contratiempo, hacia arriba
    // (de la aguda a la grave).
    const arriba = golpe % 1 !== 0;
    const n = acordes[nombre].length;
    acordes[nombre].forEach((p, i) =>
      guitarra.push([p, t + golpe + (arriba ? n - 1 - i : i) * 0.03, 0.45, golpe === 0 ? 105 : 80]),
    );
  }
  t += 4;
}
guitarra.push(...acordes.Am.map((p, i) => [p, t + i * 0.04, 3.5, 100]));

// Guitarra: melodía sencilla en la posición 5.
const melodia = [69, 72, 74, 76, 74, 72, 69, 67, 69, 72, 76, 79, 76, 74, 72, 69];
const guitarraMelodia = melodia.map((p, i) => [p, i * 0.5, 0.45, 85]);

// Bajo: tónica y quinta en corcheas (La, Fa, Do, Sol).
const bajo = [];
t = 0;
for (const raiz of [33, 29, 36, 31, 33, 29, 36, 31]) {
  for (let i = 0; i < 8; i++)
    bajo.push([i % 4 === 3 ? raiz + 7 : raiz, t + i * 0.5, 0.45, i % 2 ? 80 : 100]);
  t += 4;
}

// Batería rock: bombo en 1 y 3, caja en 2 y 4, hi-hat en corcheas; crash al empezar y un fill
// de toms al final de cada 4 compases.
const rock = [];
for (let c = 0; c < 8; c++) {
  const b = c * 4;
  if (c % 4 === 0) rock.push([49, b, 0.25, 110]);
  const fill = c % 4 === 3;
  for (let i = 0; i < 8; i++) {
    const x = b + i * 0.5;
    if (fill && i >= 4) continue;
    rock.push([42, x, 0.25, i % 2 ? 70 : 95]);
  }
  rock.push([36, b, 0.25, 110], [36, b + 2, 0.25, 105], [36, b + 2.5, 0.25, 90]);
  rock.push([38, b + 1, 0.25, 110]);
  if (!fill) rock.push([38, b + 3, 0.25, 110]);
  else
    for (const [p, k] of [
      [50, 0],
      [50, 1],
      [47, 2],
      [47, 3],
      [43, 4],
      [43, 5],
      [38, 6],
      [38, 7],
    ])
      rock.push([p, b + 2 + k * 0.25, 0.2, 100]);
}
rock.push([49, 32, 0.25, 120], [36, 32, 0.25, 120]);

// Batería funk: hi-hat en semicorcheas con acentos, caja con notas fantasma y un hi-hat abierto.
const funk = [];
for (let c = 0; c < 8; c++) {
  const b = c * 4;
  for (let i = 0; i < 16; i++) {
    const x = b + i * 0.25;
    funk.push([i === 14 ? 46 : 42, x, 0.2, i % 4 === 0 ? 100 : i % 2 ? 55 : 75]);
  }
  for (const k of [0, 0.75, 2.5]) funk.push([36, b + k, 0.2, 110]);
  funk.push([38, b + 1, 0.2, 115], [38, b + 3, 0.2, 115]);
  for (const k of [1.75, 2.25, 3.75]) funk.push([38, b + k, 0.2, 35]);
}

const piezas = [
  {
    archivo: 'guitarra-arpegios',
    nombre: 'Guitarra: arpegios',
    canal: 0,
    programa: 25,
    bpm: 90,
    notas: guitarra,
  },
  {
    archivo: 'guitarra-melodia',
    nombre: 'Guitarra: melodia',
    canal: 0,
    programa: 24,
    bpm: 100,
    notas: guitarraMelodia,
  },
  { archivo: 'bajo-rock', nombre: 'Bajo: rock', canal: 0, programa: 33, bpm: 110, notas: bajo },
  {
    archivo: 'bateria-rock',
    nombre: 'Bateria: rock',
    canal: 9,
    programa: 0,
    bpm: 110,
    notas: rock,
  },
  { archivo: 'bateria-funk', nombre: 'Bateria: funk', canal: 9, programa: 0, bpm: 96, notas: funk },
];
mkdirSync('fixtures/demos', { recursive: true });
for (const p of piezas) {
  writeFileSync(`fixtures/demos/${p.archivo}.mid`, midi(p));
  process.stdout.write(`fixtures/demos/${p.archivo}.mid (${p.notas.length} notas)\n`);
}
