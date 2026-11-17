import { expect, test } from '@playwright/test';

/** WAV mono de 16 bits con tres notas tipo piano (do, mi, sol) una tras otra. */
function wavDeAcorde(): Buffer {
  const rate = 22_050;
  const seconds = 3;
  const samples = new Int16Array(rate * seconds);
  [60, 64, 67].forEach((pitch, k) => {
    const f0 = 440 * Math.pow(2, (pitch - 69) / 12);
    const at = Math.round((0.3 + k * 0.8) * rate);
    for (let i = 0; i < rate * 0.7 && at + i < samples.length; i++) {
      const ph = (2 * Math.PI * f0 * i) / rate;
      const v =
        (Math.sin(ph) + 0.5 * Math.sin(2 * ph) + 0.25 * Math.sin(3 * ph)) *
        Math.exp(-i / (rate * 0.25));
      samples[at + i] = Math.round(v * 9000);
    }
  });
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + samples.byteLength, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(samples.byteLength, 40);
  return Buffer.concat([header, Buffer.from(samples.buffer)]);
}

test('convierte un audio en notas y lo abre como pieza', async ({ page }, info) => {
  test.skip(info.project.name === 'celular', 'La conversión está en el estudio de escritorio');
  test.setTimeout(180_000);
  await page.goto('/estudio');
  const seccion = page.getByRole('region', { name: 'Audio a notas' });
  await expect(seccion.getByRole('button', { name: 'Convertir un audio' })).toBeVisible();

  await seccion.locator('input[type=file]').setInputFiles({
    name: 'acorde-prueba.wav',
    mimeType: 'audio/wav',
    buffer: wavDeAcorde(),
  });

  // Termina sin error, el estudio abre la pieza transcrita y la sección vuelve a su estado inicial.
  await expect(page.getByRole('strong').filter({ hasText: 'acorde-prueba' })).toBeVisible({
    timeout: 150_000,
  });
  await expect(seccion.getByRole('alert')).toHaveCount(0);
  await expect(seccion.getByRole('button', { name: 'Convertir un audio' })).toBeVisible();
  await page.screenshot({ path: `test-results/capturas/transcribir-${info.project.name}.png` });

  // Y se guarda como MIDI estándar.
  const descarga = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Guardar MIDI' }).click();
  const archivo = await descarga;
  expect(archivo.suggestedFilename()).toBe('acorde-prueba.mid');
  const bytes = await (await archivo.createReadStream()).toArray();
  expect(Buffer.concat(bytes).subarray(0, 4).toString('latin1')).toBe('MThd');
});
