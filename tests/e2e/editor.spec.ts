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
