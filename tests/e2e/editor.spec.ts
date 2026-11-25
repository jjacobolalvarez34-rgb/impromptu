import { expect, test } from '@playwright/test';

/** MIDI tipo 0 mínimo: do, re, mi, fa, sol en negras a 120 BPM. */
function midiEscala(): Buffer {
  const vlq = (n: number) => {
    const bytes = [n & 0x7f];
    while ((n >>= 7)) bytes.unshift((n & 0x7f) | 0x80);
    return bytes;
  };
  const events: number[] = [0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20];
  events.push(0x00, 0xff, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08);
  for (const pitch of [60, 62, 64, 65, 67])
    events.push(0x00, 0x90, pitch, 90, ...vlq(480), 0x80, pitch, 0);
  events.push(0x00, 0xff, 0x2f, 0x00);
  const header = Buffer.from([0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, 0x01, 0xe0]);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(events.length);
  return Buffer.concat([header, Buffer.from('MTrk'), len, Buffer.from(events)]);
}

test('editar la partitura: tocar una nota, subirla y deshacer', async ({ page }, info) => {
  test.skip(
    info.project.name === 'celular',
    'El editor de la hoja está en el estudio de escritorio',
  );
  test.setTimeout(120_000);
  await page.goto('/estudio?instrumento=piano');
  await page.locator('input[accept=".mid,.midi,audio/midi"]').setInputFiles({
    name: 'escala.mid',
    mimeType: 'audio/midi',
    buffer: midiEscala(),
  });
  await page.getByRole('tab', { name: 'Partitura' }).click();
  const primera = page.locator('[data-compas="0"][data-pentagrama="0"]').first();
  await expect(primera).toBeVisible({ timeout: 60_000 });
  await primera.click();
  const barra = page.getByRole('toolbar', { name: 'Editar la partitura' });
  await expect(barra).toBeVisible();
  await expect(barra.getByRole('status')).toHaveText('Do4');
  await page.keyboard.press('ArrowUp');
  await expect(barra.getByRole('status')).toHaveText('Do♯4');
  await page.screenshot({ path: `test-results/capturas/editor-${info.project.name}.png` });
  await barra.getByRole('button', { name: 'Deshacer (Ctrl+Z)' }).click();
  await expect(page.locator('[data-compas="0"][data-pentagrama="0"]').first()).toBeVisible();
});

test('tocar la cabeza de una nota elige esa nota, no la siguiente', async ({ page }, info) => {
  test.skip(info.project.name === 'celular', 'El editor de la hoja está en el escritorio');
  test.setTimeout(120_000);
  await page.goto('/estudio?instrumento=piano');
  await page.locator('input[accept=".mid,.midi,audio/midi"]').setInputFiles({
    name: 'escala.mid',
    mimeType: 'audio/midi',
    buffer: midiEscala(),
  });
  await page.getByRole('tab', { name: 'Partitura' }).click();
  await expect(page.locator('[data-compas="0"][data-pentagrama="0"]').first()).toBeVisible({
    timeout: 60_000,
  });
  const barra = page.getByRole('toolbar', { name: 'Editar la partitura' });
  // Clic justo en la cabeza de cada nota, como lo haría una persona (pedido de Jacobo).
  const cabezas = page.locator('[data-pentagrama="0"] .vf-notehead');
  for (const [i, nombre] of [
    [1, 'Re4'],
    [2, 'Mi4'],
    [0, 'Do4'],
  ] as const) {
    const caja = (await cabezas.nth(i).boundingBox())!;
    await page.mouse.click(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await expect(barra.getByRole('status')).toHaveText(nombre);
  }
});

/** Un acorde de do mayor (do, mi, sol) en blanca y después un do suelto. */
function midiAcorde(): Buffer {
  const events: number[] = [0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20];
  events.push(0x00, 0xff, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08);
  events.push(0x00, 0x90, 60, 90, 0x00, 0x90, 64, 90, 0x00, 0x90, 67, 90);
  // 960 ticks (una blanca) = 0x87 0x40 en cantidad variable.
  events.push(0x87, 0x40, 0x80, 60, 0, 0x00, 0x80, 64, 0, 0x00, 0x80, 67, 0);
  events.push(0x00, 0x90, 72, 90, 0x87, 0x40, 0x80, 72, 0);
  events.push(0x00, 0xff, 0x2f, 0x00);
  const header = Buffer.from([0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, 0x01, 0xe0]);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(events.length);
  return Buffer.concat([header, Buffer.from('MTrk'), len, Buffer.from(events)]);
}

test('en un acorde, tocar una cabeza elige esa nota (no la última del acorde)', async ({
  page,
}, info) => {
  test.skip(info.project.name === 'celular', 'El editor de la hoja está en el escritorio');
  test.setTimeout(120_000);
  await page.goto('/estudio?instrumento=piano');
  await page.locator('input[accept=".mid,.midi,audio/midi"]').setInputFiles({
    name: 'acorde.mid',
    mimeType: 'audio/midi',
    buffer: midiAcorde(),
  });
  await page.getByRole('tab', { name: 'Partitura' }).click();
  const acorde = page.locator('[data-compas="0"][data-pentagrama="0"]').first();
  await expect(acorde).toBeVisible({ timeout: 60_000 });
  const barra = page.getByRole('toolbar', { name: 'Editar la partitura' });
  const cabezas = acorde.locator('.vf-notehead');
  await expect(cabezas).toHaveCount(3);
  // De arriba (aguda) = 0 hacia abajo (grave) = 2. Se mide antes de cada clic: al elegir, la
  // barra de edición aparece y la hoja se mueve.
  for (const [puesto, nombre] of [
    [0, 'Sol4'],
    [2, 'Do4'],
    [1, 'Mi4'],
  ] as const) {
    const cajas = await Promise.all([0, 1, 2].map((i) => cabezas.nth(i).boundingBox()));
    const caja = cajas.map((c) => c!).sort((a, b) => a.y - b.y)[puesto]!;
    await page.mouse.click(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await expect(barra.getByRole('status')).toHaveText(nombre);
  }
});

test('exporta el video de la partitura', async ({ page }, info) => {
  test.skip(info.project.name === 'celular', 'La partitura está en el estudio de escritorio');
  test.setTimeout(240_000);
  await page.goto('/estudio?instrumento=piano');
  await page.locator('input[accept=".mid,.midi,audio/midi"]').setInputFiles({
    name: 'escala.mid',
    mimeType: 'audio/midi',
    buffer: midiEscala(),
  });
  await page.getByRole('tab', { name: 'Partitura' }).click();
  await expect(page.locator('[data-compas="0"]').first()).toBeVisible({ timeout: 60_000 });
  // Pedido 29: sigue en segundo plano aunque se cambie de pestaña y se descarga solo.
  const descarga = page.waitForEvent('download', { timeout: 200_000 });
  await page.getByRole('button', { name: 'Video de la partitura' }).click();
  await page.getByRole('tab', { name: 'Estudio' }).click();
  const burbuja = page.getByRole('button', { name: /trabajos en segundo plano/ });
  await expect(burbuja).toBeVisible();
  await burbuja.click();
  await expect(page.getByRole('list', { name: 'Trabajos en segundo plano' })).toContainText(
    'Video de la partitura',
  );
  const archivo = await descarga;
  expect(archivo.suggestedFilename()).toMatch(/^escala-partitura\.(mp4|webm)$/);
  await archivo.saveAs(
    'test-results/capturas/video-partitura.' + archivo.suggestedFilename().split('.').pop(),
  );
});

test('la hoja se mueve libre y "Volver a donde vamos" la regresa (pedido 61)', async ({
  page,
}, info) => {
  test.skip(info.project.name === 'celular', 'Basta con el escritorio');
  test.setTimeout(120_000);
  await page.goto('/estudio?instrumento=piano');
  await page.locator('input[accept=".mid,.midi,audio/midi"]').setInputFiles({
    name: 'escala.mid',
    mimeType: 'audio/midi',
    buffer: midiEscala(),
  });
  await page.getByRole('tab', { name: 'Partitura' }).click();
  await expect(page.locator('[data-compas="0"][data-pentagrama="0"]').first()).toBeVisible({
    timeout: 60_000,
  });
  const volver = page.getByRole('button', { name: 'Volver a donde vamos' });
  await expect(volver).toHaveCount(0);
  // Mover la hoja con la rueda: deja de seguir el cursor y aparece el botón.
  await page.getByRole('main', { name: /^Partitura de/ }).hover();
  await page.mouse.wheel(0, 400);
  await expect(volver).toBeVisible();
  await volver.click();
  await expect(volver).toHaveCount(0);
});
