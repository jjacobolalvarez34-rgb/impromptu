import { expect, test } from '@playwright/test';

/** MIDI tipo 0 mínimo: do, re, mi, fa, sol en negras a 120 BPM (480 ticks por negra). */
function midiEscala(): Buffer {
  const vlq = (n: number) => {
    const bytes = [n & 0x7f];
    while ((n >>= 7)) bytes.unshift((n & 0x7f) | 0x80);
    return bytes;
  };
  const events: number[] = [0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20]; // tempo 500000 µs
  events.push(0x00, 0xff, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08); // compás 4/4
  for (const pitch of [60, 62, 64, 65, 67]) {
    events.push(0x00, 0x90, pitch, 90, ...vlq(480), 0x80, pitch, 0);
  }
  events.push(0x00, 0xff, 0x2f, 0x00);
  const header = Buffer.from([0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, 0x01, 0xe0]);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(events.length);
  return Buffer.concat([header, Buffer.from('MTrk'), len, Buffer.from(events)]);
}

test('la pestaña Partitura escribe la pieza y exporta MusicXML', async ({ page }, info) => {
  test.skip(info.project.name === 'celular', 'La partitura está en el estudio de escritorio');
  test.setTimeout(120_000);
  await page.goto('/estudio');
  await page.locator('input[accept=".mid,.midi,audio/midi"]').setInputFiles({
    name: 'escala.mid',
    mimeType: 'audio/midi',
    buffer: midiEscala(),
  });
  await expect(page.getByRole('strong').filter({ hasText: 'escala' })).toBeVisible();

  await page.getByRole('tab', { name: 'Partitura' }).click();
  const hoja = page.getByRole('main', { name: /Partitura de escala/ });
  // OSMD dibuja en SVG: aparece al menos un pentagrama.
  await expect(hoja.locator('svg').first()).toBeVisible({ timeout: 60_000 });
  const panel = page.getByRole('complementary', { name: 'Ajustes de la partitura' });
  await expect(panel.getByText('del archivo')).toBeVisible();

  const descarga = page.waitForEvent('download');
  await panel.getByRole('button', { name: 'MusicXML' }).click();
  const archivo = await descarga;
  expect(archivo.suggestedFilename()).toBe('escala.musicxml');
  const xml = Buffer.concat(await (await archivo.createReadStream()).toArray()).toString('utf8');
  expect(xml).toContain('<score-partwise version="4.0">');
  // Las cinco notas, en negras, en el pentagrama de arriba.
  expect(xml.match(/<step>[CDEFG]<\/step>/g)).toHaveLength(5);
  await page.screenshot({ path: `test-results/capturas/partitura-${info.project.name}.png` });
});
