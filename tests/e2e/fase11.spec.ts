import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Fase 11 (gráficos): capturas de la guitarra y la batería con las piezas de prueba, para
 * revisar a ojo los números de traste, las gemas de la batería y lo demás de esta fase.
 */
async function abrirPrueba(page: Page, nombre: RegExp, instrumento: RegExp, desde = 0) {
  await page.goto('/estudio');
  await page.getByRole('button', { name: nombre }).filter({ hasText: instrumento }).first().click();
  await expect(page.getByRole('button', { name: /Reproducir/ }).first()).toBeEnabled();
  // Ir a un momento de la pieza con la línea de tiempo (Mayús + → avanza 10 s, → 2 s).
  if (desde > 0) {
    await page.getByRole('slider', { name: /Línea de tiempo/ }).focus();
    for (let s = 0; s + 10 <= desde; s += 10) await page.keyboard.press('Shift+ArrowRight');
    for (let s = 0; s + 2 <= desde % 10; s += 2) await page.keyboard.press('ArrowRight');
  }
  // Que suene un rato: las notas quedan cerca del mástil o de los parches.
  await page.getByRole('button', { name: 'Reproducir', exact: true }).click();
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: 'Pausar', exact: true }).click();
  await page.waitForTimeout(300);
}

test('guitarra: números de traste legibles', async ({ page }, info) => {
  test.skip(info.project.name === 'celular', 'Capturas de escritorio');
  test.setTimeout(240_000);
  // Al final de la pieza hay rasgueos: flechas hacia abajo (ámbar) y hacia arriba (verde).
  await abrirPrueba(page, /rasgueo/, /Guitarra/, 2);
  await page.screenshot({ path: 'test-results/capturas/fase11-guitarra.png' });
});

test('batería: golpes como gemas que no se pegan', async ({ page }, info) => {
  test.skip(info.project.name === 'celular', 'Capturas de escritorio');
  test.setTimeout(240_000);
  await page.goto('/estudio');
  // El pulso del tempo en la esquina (pedido 18), con la opción de que suene.
  await page.getByRole('switch', { name: 'Pulso en una esquina' }).click();
  await expect(page.getByRole('switch', { name: 'Que suene el pulso' })).toBeVisible();
  await abrirPrueba(page, /rock/, /Batería/);
  await page.screenshot({ path: 'test-results/capturas/fase11-bateria.png' });

  // Vista de batería real (pedido 17): cada pieza en su lugar.
  await page.getByRole('radio', { name: 'Batería real' }).click();
  await expect(page.getByText('Cada pieza está donde va en una batería')).toBeVisible();
  await page.getByRole('button', { name: 'Reproducir', exact: true }).click();
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Pausar', exact: true }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'test-results/capturas/fase11-bateria-real.png' });
});

test('batería: el hi-hat abierto se ve hueco y el cerrado lleno', async ({ page }, info) => {
  test.skip(info.project.name === 'celular', 'Capturas de escritorio');
  test.setTimeout(240_000);
  await abrirPrueba(page, /funk/, /Batería/);
  await page.screenshot({ path: 'test-results/capturas/fase11-hihat.png' });
});

test('calidad del piano: elegir Alta baja más capas (pedido 33)', async ({ page }, info) => {
  test.skip(info.project.name === 'celular', 'Ajustes del escritorio');
  test.setTimeout(240_000);
  const pedidas = new Set<string>();
  page.on('request', (r) => {
    const m = /\/audio\/[A-Za-z]+\d+v(\d+)\.mp3$/.exec(r.url());
    if (m) pedidas.add(m[1]!);
  });
  await page.goto('/estudio?instrumento=piano');
  const calidad = page.getByRole('radiogroup', { name: 'Calidad del piano' });
  await calidad.getByRole('radio', { name: 'Alta' }).click();
  await expect(page.getByText(/8 capas de fuerza|Descargando el piano/)).toBeVisible();
  // Capas que solo tiene la calidad alta (3, 7, 11).
  await expect
    .poll(() => ['3', '7', '11'].every((c) => pedidas.has(c)), { timeout: 60_000 })
    .toBe(true);
});

/** MIDI de piano: arpegios en la izquierda y acordes con melodía en la derecha (4 compases). */
function midiPiano(): Buffer {
  const vlq = (n: number) => {
    const b = [n & 0x7f];
    while ((n >>= 7)) b.unshift((n & 0x7f) | 0x80);
    return b;
  };
  const eventos: [number, number, number][] = []; // [tick, nota, 1 prende / 0 apaga]
  const acordes = [
    [48, 55, 60, 64, 72, 76, 79],
    [43, 50, 55, 59, 71, 74, 79],
    [45, 52, 57, 60, 72, 76, 81],
    [41, 48, 53, 57, 69, 72, 77],
  ];
  acordes.forEach((a, c) => {
    for (let k = 0; k < 8; k++) {
      const t = c * 1920 + k * 240;
      const nota = a[k % 4]!;
      eventos.push([t, nota, 1], [t + 230, nota, 0]);
    }
    for (const nota of a.slice(4)) eventos.push([c * 1920, nota, 1], [c * 1920 + 1800, nota, 0]);
  });
  eventos.sort((x, y) => x[0] - y[0] || x[2] - y[2]);
  const datos: number[] = [0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20];
  let antes = 0;
  for (const [t, nota, on] of eventos) {
    datos.push(...vlq(t - antes), on ? 0x90 : 0x80, nota, on ? 92 : 0);
    antes = t;
  }
  datos.push(0x00, 0xff, 0x2f, 0x00);
  const cabeza = Buffer.from([0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, 0x01, 0xe0]);
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(datos.length);
  return Buffer.concat([cabeza, Buffer.from('MTrk'), largo, Buffer.from(datos)]);
}

test('piano con acabado de calidad: notas redondeadas, teclado realista, humo (pedido 41)', async ({
  page,
}, info) => {
  test.skip(info.project.name === 'celular', 'Capturas de escritorio');
  test.setTimeout(600_000);
  // eslint-disable-next-line no-console
  page.on('pageerror', (e) => console.log('ERROR DE LA PÁGINA:', e.message));
  await page.goto('/estudio?instrumento=piano');
  await page.locator('input[accept=".mid,.midi,audio/midi"]').setInputFiles({
    name: 'acordes.mid',
    mimeType: 'audio/midi',
    buffer: midiPiano(),
  });
  await expect(page.getByRole('button', { name: 'Reproducir', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Reproducir', exact: true }).click();
  await page.waitForTimeout(2600);
  await page.getByRole('button', { name: 'Pausar', exact: true }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'test-results/capturas/fase11-piano.png' });
  // El teclado más arriba (deja lugar para las manos).
  const altura = page.getByRole('slider', { name: 'Altura del teclado' });
  await altura.focus();
  for (let i = 0; i < 25; i++) await page.keyboard.press('ArrowRight');
  // Desde el inicio y pausando solo si sigue sonando (con el equipo lento la pieza de 8 s se acaba).
  const momento = async (espera: number) => {
    await page.getByRole('button', { name: 'Ir al inicio' }).click();
    await page.getByRole('button', { name: 'Reproducir', exact: true }).click();
    await page.waitForTimeout(espera);
    const pausar = page.getByRole('button', { name: 'Pausar', exact: true });
    if (await pausar.isVisible()) await pausar.click();
  };
  await momento(1200);
  await page.screenshot({ path: 'test-results/capturas/fase11-piano-arriba.png' });
  // Pedido 64: los ocho estilos con volumen que aprobó Jacobo; Vidrio es el de por defecto.
  const estilos = page.getByRole('radiogroup', { name: 'Estilo de las notas' });
  await expect(estilos.getByRole('radio', { name: 'Vidrio', exact: true })).toBeChecked();
  const lienzo = page.getByLabel('Visualizador de notas');
  for (const nombre of [
    'Vidrio',
    'Bloques',
    'Gemas',
    'Oro',
    'Diamantes',
    'Luz',
    'Claro',
    'Chispa',
  ]) {
    await estilos.getByRole('radio', { name: nombre, exact: true }).click();
    await momento(1500);
    await lienzo.screenshot({ path: `test-results/capturas/nota-${nombre.toLowerCase()}.png` });
  }
  // "Claro" pone su fondo gris; al volver a otro estilo regresa el tema Ámbar.
  await estilos.getByRole('radio', { name: 'Claro', exact: true }).click();
  await expect(page.getByRole('radio', { name: 'Claro', exact: true }).first()).toBeChecked();
  await estilos.getByRole('radio', { name: 'Satín' }).click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'test-results/capturas/fase11-piano-satin.png' });
  // Colores listos: "Hielo" (azul y blanco) con Cristal.
  await estilos.getByRole('radio', { name: 'Cristal' }).click();
  const hielo = page
    .getByRole('group', { name: 'Colores listos' })
    .getByRole('button', { name: 'Hielo' });
  await hielo.click();
  await expect(hielo).toHaveAttribute('aria-pressed', 'true');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'test-results/capturas/fase11-piano-hielo.png' });
});

test('bajo: mástil realista y el dedo que pulsa (i, m)', async ({ page }, info) => {
  test.skip(info.project.name === 'celular', 'Capturas de escritorio');
  test.setTimeout(240_000);
  await abrirPrueba(page, /rock/, /Bajo/);
  await page.screenshot({ path: 'test-results/capturas/fase11-bajo.png' });
});
