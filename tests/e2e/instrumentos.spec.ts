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
  await page.getByRole('button', { name: 'Abrir con guitarra' }).click();
  await expect(page).toHaveURL(/instrumento=guitarra/);
});
