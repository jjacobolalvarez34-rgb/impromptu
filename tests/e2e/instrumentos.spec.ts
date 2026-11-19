import { expect, test } from '@playwright/test';

test('el estudio se abre con guitarra o batería y muestra sus opciones', async ({ page }, info) => {
  test.skip(info.project.name === 'celular', 'Las opciones están en el estudio de escritorio');
  await page.goto('/estudio?instrumento=guitarra');
  const selector = page.getByRole('button', { name: /^Instrumento: Guitarra/ });
  await expect(selector).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Tablatura' })).toBeVisible();
  await expect(page.getByRole('radiogroup', { name: 'Sonido de la guitarra' })).toBeVisible();
  // Lo del piano no aparece.
  await expect(page.getByRole('switch', { name: 'Números de dedo' })).toHaveCount(0);

  // El tablero de arriba cambia a batería.
  await selector.click();
  const tablero = page.getByRole('radiogroup', { name: 'Elegir instrumento' });
  await expect(tablero).toBeVisible();
  await page.screenshot({ path: `test-results/capturas/selector-${info.project.name}.png` });
  await tablero.getByRole('radio', { name: /Batería/ }).click();
  await expect(tablero).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Instrumento: Batería/ })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Partitura de batería' })).toBeVisible();
  await expect(page.getByRole('radiogroup', { name: 'Sensibilidad del micrófono' })).toBeVisible();

  // Sin pieza, la hoja muestra el pentagrama vacío.
  await page.getByRole('tab', { name: 'Partitura de batería' }).click();
  await expect(page.getByText('Hoja vacía.')).toBeVisible();
});

test('la pantalla principal abre el estudio con guitarra', async ({ page }) => {
  await page.goto('/app');
  // Pedido 46: el estudio se abre en otra pestaña.
  const [nueva] = await Promise.all([
    page.waitForEvent('popup'),
    page.getByRole('button', { name: 'Abrir con guitarra' }).click(),
  ]);
  await expect(nueva).toHaveURL(/instrumento=guitarra/);
  await expect(page).toHaveURL(/\/app$/);
});

test('se bajan los sonidos grabados del instrumento elegido (pedido 25)', async ({
  page,
}, info) => {
  test.skip(info.project.name === 'celular', 'Basta con probarlo en escritorio');
  const pedidos: string[] = [];
  page.on('response', (r) => {
    const ruta = new URL(r.url()).pathname;
    if (ruta.includes('/instrumentos/') && r.ok()) pedidos.push(ruta);
  });
  await page.goto('/estudio?instrumento=guitarra');
  // La guitarra de acero (timbre por defecto): manifiesto y sus grabaciones.
  await expect
    .poll(
      () => pedidos.filter((p) => p.includes('/instrumentos/acero/') && p.endsWith('.flac')).length,
      {
        timeout: 20_000,
      },
    )
    .toBeGreaterThan(15);
  expect(pedidos.some((p) => p.includes('/instrumentos/bateria/'))).toBe(false);

  await page.getByRole('button', { name: /^Instrumento: Guitarra/ }).click();
  await page
    .getByRole('radiogroup', { name: 'Elegir instrumento' })
    .getByRole('radio', { name: /Batería/ })
    .click();
  await expect
    .poll(
      () =>
        pedidos.filter((p) => p.includes('/instrumentos/bateria/') && p.endsWith('.flac')).length,
      {
        timeout: 30_000,
      },
    )
    .toBeGreaterThan(60);

  // Cada banco se decodifica en el navegador (FLAC) y no está en silencio.
  const picos = await page.evaluate(async () => {
    const ctx = new OfflineAudioContext(2, 44100, 44100);
    const salida: Record<string, number> = {};
    for (const banco of ['nylon', 'acero', 'electrica', 'bajo', 'bateria']) {
      const m = (await (await fetch(`/instrumentos/${banco}/manifiesto.json`)).json()) as {
        zonas?: { archivo: string }[];
        piezas?: Record<string, { archivos: string[] }[]>;
      };
      const archivo = m.zonas?.[0]?.archivo ?? Object.values(m.piezas ?? {})[0]![0]!.archivos[0]!;
      const datos = await (await fetch(`/instrumentos/${banco}/${archivo}`)).arrayBuffer();
      const canal = (await ctx.decodeAudioData(datos)).getChannelData(0);
      salida[banco] = canal.reduce((mx, v) => Math.max(mx, Math.abs(v)), 0);
    }
    return salida;
  });
  expect(Object.keys(picos)).toHaveLength(5);
  for (const pico of Object.values(picos)) expect(pico).toBeGreaterThan(0.05);
});

test('En vivo dentro del estudio y la pantalla para transmitir (pedido 47)', async ({
  page,
}, info) => {
  test.skip(info.project.name === 'celular', 'El estudio de escritorio');
  test.setTimeout(120_000);
  await page.goto('/estudio');
  await page.getByRole('tab', { name: 'En vivo' }).click();
  // Sigue en el estudio, con sus columnas, y la pestaña En vivo marcada.
  await expect(page).toHaveURL(/\/estudio/);
  await expect(page.getByRole('tab', { name: 'En vivo' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('complementary', { name: 'Ajustes del visualizador' })).toBeVisible();
  const barra = page.getByRole('status').filter({ hasText: 'En vivo · toca tu instrumento' });
  await expect(barra).toBeVisible();
  const [pantalla] = await Promise.all([
    page.waitForEvent('popup'),
    barra.getByRole('button', { name: 'Pantalla para transmitir' }).click(),
  ]);
  await expect(pantalla).toHaveURL(/\/en-vivo/);
  // Volver a la pestaña Estudio sale del modo en vivo.
  await page.getByRole('tab', { name: 'Estudio' }).click();
  await expect(barra).toHaveCount(0);
});
