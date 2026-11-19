import { expect, test } from '@playwright/test';

test('arrastrar sobre el visualizador selecciona varias notas y las transpone juntas', async ({
  page,
}, info) => {
  test.skip(info.project.name === 'celular', 'El editor está en el estudio de escritorio');
  await page.goto('/estudio');
  await page.getByRole('button', { name: /arpegios/ }).click();
  const lienzo = page.locator('canvas').first();
  await expect(lienzo).toBeVisible();
  await page.waitForTimeout(800);
  const caja = (await lienzo.boundingBox())!;
  // De la esquina de arriba a la izquierda hasta abajo a la derecha (zona de notas).
  await page.mouse.move(caja.x + 4, caja.y + 4);
  await page.mouse.down();
  await page.mouse.move(caja.x + caja.width * 0.98, caja.y + caja.height * 0.75, { steps: 8 });
  await page.mouse.up();
  const barra = page.getByRole('toolbar', { name: 'Editar notas seleccionadas' });
  await expect(barra).toBeVisible();
  await expect(barra.getByRole('status')).toHaveText(/\d+ notas/);
  await page.screenshot({ path: `test-results/capturas/seleccion-${info.project.name}.png` });
  await barra.getByRole('button', { name: 'Subir una octava (Shift ↑)' }).click();
  await expect(barra.getByRole('status')).toHaveText(/\d+ notas/);
});
