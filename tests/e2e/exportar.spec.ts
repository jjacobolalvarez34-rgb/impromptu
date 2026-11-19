import { expect, test } from '@playwright/test';

/** MIDI tipo 0 mínimo: do, mi, sol en negras a 120 BPM. */
function midiCorto(): Buffer {
  const events: number[] = [0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20];
  for (const pitch of [60, 64, 67]) events.push(0x00, 0x90, pitch, 90, 0x83, 0x60, 0x80, pitch, 0);
  events.push(0x00, 0xff, 0x2f, 0x00);
  const header = Buffer.from([0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, 0x01, 0xe0]);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(events.length);
  return Buffer.concat([header, Buffer.from('MTrk'), len, Buffer.from(events)]);
}

test('exportar video muestra una vista previa con la forma del formato', async ({ page }, info) => {
  test.skip(
    info.project.name === 'celular',
    'El diálogo de exportar está en el estudio de escritorio',
  );
  await page.goto('/estudio');
  await page.locator('input[accept=".mid,.midi,audio/midi"]').setInputFiles({
    name: 'corto.mid',
    mimeType: 'audio/midi',
    buffer: midiCorto(),
  });
  await page.getByRole('button', { name: 'Exportar video' }).first().click();
  const dialogo = page.getByRole('dialog', { name: 'Exportar video' });
  const previa = dialogo.getByRole('img', { name: 'Vista previa del video' }).locator('canvas');
  await expect(previa).toBeVisible();
  const horizontal = await previa.boundingBox();
  expect(horizontal!.width).toBeGreaterThan(horizontal!.height);

  await dialogo.getByRole('radio', { name: 'Vertical 9:16' }).click();
  await expect(async () => {
    const vertical = await previa.boundingBox();
    expect(vertical!.height).toBeGreaterThan(vertical!.width);
  }).toPass();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `test-results/capturas/exportar-${info.project.name}.png` });
});

test('la pantalla principal anuncia la cuenta y la nube', async ({ page }) => {
  await page.goto('/app');
  await expect(page.getByRole('heading', { name: 'Próximamente: cuenta y nube' })).toBeVisible();
});

test('el video sigue en segundo plano al cerrar la ventana y se descarga solo', async ({
  page,
}, info) => {
  test.skip(info.project.name === 'celular', 'Exportar está en el estudio de escritorio');
  test.setTimeout(300_000);
  await page.goto('/estudio');
  await page
    .getByRole('button', { name: /melodía/ })
    .filter({ hasText: /Guitarra/ })
    .first()
    .click();
  await page.getByRole('button', { name: 'Exportar video' }).first().click();
  const dialogo = page.getByRole('dialog', { name: 'Exportar video' });
  await dialogo.getByRole('radio', { name: '30 fps' }).click();
  const descarga = page.waitForEvent('download', { timeout: 280_000 });
  await dialogo.getByRole('button', { name: 'Exportar', exact: true }).click();
  await dialogo.getByRole('button', { name: 'Seguir en segundo plano' }).click();
  await expect(dialogo).toBeHidden();
  const burbuja = page.getByRole('button', { name: /trabajos en segundo plano/ });
  await expect(burbuja).toBeVisible();
  await burbuja.click();
  await expect(page.getByRole('list', { name: 'Trabajos en segundo plano' })).toContainText(
    'Video: ',
  );
  const archivo = await descarga;
  expect(archivo.suggestedFilename()).toMatch(/\.(mp4|webm)$/);
});
