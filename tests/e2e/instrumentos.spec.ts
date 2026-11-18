import { expect, test } from '@playwright/test';

test('el estudio se abre con guitarra o batería y muestra sus opciones', async ({ page }, info) => {
  test.skip(info.project.name === 'celular', 'Las opciones están en el estudio de escritorio');
  await page.goto('/estudio?instrumento=guitarra');
  await expect(page.getByRole('radio', { name: 'Guitarra' })).toBeChecked();
  await expect(page.getByRole('radiogroup', { name: 'Sonido de la guitarra' })).toBeVisible();
  await expect(page.getByRole('radiogroup', { name: 'Afinación' })).toBeVisible();
  // Lo del piano no aparece.
  await expect(page.getByRole('switch', { name: 'Números de dedo' })).toHaveCount(0);

  await page.goto('/estudio?instrumento=bateria');
  await expect(page.getByRole('radio', { name: 'Batería' })).toBeChecked();
  await expect(page.getByRole('radiogroup', { name: 'Sensibilidad del micrófono' })).toBeVisible();
  await expect(page.getByText('Conecta tu batería electrónica por USB.')).toBeVisible();
});

test('la pantalla principal abre el estudio con guitarra', async ({ page }) => {
  await page.goto('/app');
  await page.getByRole('button', { name: 'Abrir con guitarra' }).click();
  await expect(page).toHaveURL(/instrumento=guitarra/);
});
