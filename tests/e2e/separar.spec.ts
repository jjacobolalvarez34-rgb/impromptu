import { expect, test } from '@playwright/test';

/**
 * Pedido 35: separar el instrumento de una canción completa (Spleeter) antes de pasarlo a notas.
 * Los modelos se sirven desde la carpeta local solo en desarrollo (PROVISIONAL P21), así que esta
 * prueba usa el servidor de desarrollo (localhost:5174) y se salta si no está prendido.
 */
const DEV = 'http://localhost:5174';

/** Una "canción" de 6 s en estéreo a 44,1 kHz: bombo, hi-hat y un acorde sostenido. */
function cancion(): Buffer {
  const tasa = 44_100;
  const n = tasa * 6;
  const datos = Buffer.alloc(44 + n * 4);
  let semilla = 1;
  const ruido = () => {
    semilla = (semilla * 1103515245 + 12345) & 0x7fffffff;
    return semilla / 0x3fffffff - 1;
  };
  for (let i = 0; i < n; i++) {
    const t = i / tasa;
    const enBombo = t % 0.5;
    const enHihat = t % 0.25;
    const bombo =
      enBombo < 0.2
        ? Math.sin(2 * Math.PI * (55 + 60 * Math.exp(-enBombo * 30)) * enBombo) *
          Math.exp(-enBombo * 12)
        : 0;
    const hihat = enHihat < 0.05 ? ruido() * Math.exp(-enHihat * 80) * 0.4 : 0;
    const acorde =
      (Math.sin(2 * Math.PI * 220 * t) +
        Math.sin(2 * Math.PI * 277.2 * t) +
        Math.sin(2 * Math.PI * 329.6 * t)) *
      0.08;
    const x = Math.max(-1, Math.min(1, bombo * 0.8 + hihat + acorde));
    const v = Math.round(x * 32767);
    datos.writeInt16LE(v, 44 + i * 4);
    datos.writeInt16LE(v, 46 + i * 4);
  }
  datos.write('RIFF', 0);
  datos.writeUInt32LE(36 + n * 4, 4);
  datos.write('WAVEfmt ', 8);
  datos.writeUInt32LE(16, 16);
  datos.writeUInt16LE(1, 20);
  datos.writeUInt16LE(2, 22);
  datos.writeUInt32LE(tasa, 24);
  datos.writeUInt32LE(tasa * 4, 28);
  datos.writeUInt16LE(4, 32);
  datos.writeUInt16LE(16, 34);
  datos.write('data', 36);
  datos.writeUInt32LE(n * 4, 40);
  return datos;
}

test('una canción con batería: se separa la batería y salen los golpes', async ({ page }, info) => {
  test.skip(info.project.name === 'celular', 'Basta con el escritorio');
  test.setTimeout(300_000);
  const prendido = await fetch(DEV)
    .then((r) => r.ok)
    .catch(() => false);
  test.skip(!prendido, 'El servidor de desarrollo no está prendido');
  await page.goto(`${DEV}/estudio?instrumento=bateria`);
  await expect(
    page.getByRole('switch', { name: 'Separar el instrumento de la canción' }),
  ).toBeChecked();
  const vistos: string[] = [];
  await page.locator('input[aria-label="Archivo de audio para convertir en notas"]').setInputFiles({
    name: 'cancion.wav',
    mimeType: 'audio/wav',
    buffer: cancion(),
  });
  // Se ve la etapa de separar y, al final, la pieza abierta con sus golpes.
  await expect
    .poll(
      async () => {
        const texto = (await page.locator('body').textContent()) ?? '';
        if (/Separando la batería|separador de instrumentos/.test(texto)) vistos.push('separar');
        return /\d+ notas/.test((await page.locator('header').first().textContent()) ?? '');
      },
      { timeout: 280_000, intervals: [1000] },
    )
    .toBe(true);
  expect(vistos.length).toBeGreaterThan(0);
  await page.screenshot({ path: 'test-results/capturas/separar-bateria.png' });
});
