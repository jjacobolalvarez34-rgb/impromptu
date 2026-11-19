import { expect, test } from '@playwright/test';

/** Página principal al día (pedidos 23 y 37) y el recorrido opcional al empezar. */
test('la página principal muestra los instrumentos por pestañas y las descargas', async ({
  page,
}, info) => {
  test.setTimeout(120_000);
  // Sin el intro del logo (se prueba aparte): así no compite con los clics.
  await page.addInitScript(() => sessionStorage.setItem('impromptu-intro-vista', '1'));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(
    'Videos de música con notas cayendo',
  );
  const pestanas = page.getByRole('tablist', { name: 'Instrumento' });
  await pestanas.scrollIntoViewIfNeeded();
  await pestanas.getByRole('tab', { name: /Batería/ }).click();
  await expect(page.getByRole('tabpanel')).toContainText('vista de batería real');
  await pestanas.getByRole('tab', { name: /Guitarra y bajo/ }).click();
  await expect(page.getByRole('tabpanel')).toContainText('Panel de rasgueo');
  await expect(pestanas.getByRole('tab', { name: /Guitarra y bajo/ })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(pestanas.getByRole('tab', { name: /Batería/ })).toHaveAttribute(
    'aria-selected',
    'false',
  );
  await page.screenshot({
    path: `test-results/capturas/landing-instrumentos-${info.project.name}.png`,
  });
  const descargas = page.getByRole('link', { name: /Descargar en GitHub/ });
  await expect(descargas.first()).toHaveAttribute('href', /releases\/latest$/);
});

test('el recorrido opcional: se ofrece la primera vez, se recorre y no vuelve a molestar', async ({
  page,
}, info) => {
  test.setTimeout(120_000);
  await page.goto('/app');
  const oferta = page.getByRole('complementary', { name: 'Recorrido de la app' });
  await expect(oferta).toBeVisible();
  await oferta.getByRole('button', { name: 'Empezar' }).click();
  const dialogo = page.getByRole('dialog');
  await expect(dialogo).toContainText('Elige tu instrumento');
  await page.screenshot({ path: `test-results/capturas/recorrido-${info.project.name}.png` });
  for (let i = 0; i < 5; i++) await dialogo.getByRole('button', { name: 'Siguiente' }).click();
  await expect(dialogo).toContainText('¡Listo!');
  await dialogo.getByRole('button', { name: 'Empezar a usar' }).click();
  await expect(page).toHaveURL(/\/estudio/);
  await page.goto('/app');
  await expect(page.getByRole('complementary', { name: 'Recorrido de la app' })).toHaveCount(0);
  // Desde la página principal se puede ver otra vez.
  await page.goto('/app?recorrido');
  await expect(page.getByRole('dialog')).toContainText('Paso 1 de 6');
});

test('el intro se desvanece y deja ver la pantalla de atrás (pedido 43)', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/app?intro');
  const saltar = page.getByRole('button', { name: 'Saltar' });
  await expect(saltar).toBeVisible();
  // La pantalla ya está debajo del intro.
  await expect(page.getByRole('heading', { name: 'Elige tu instrumento' })).toBeAttached();
  await saltar.click({ force: true });
  await expect(saltar).toBeHidden({ timeout: 3000 });
  await expect(page.getByRole('heading', { name: 'Elige tu instrumento' })).toBeVisible();
});

test('pantalla de carga al entrar y las descargas en la burbuja (pedido 45)', async ({
  page,
}, info) => {
  test.skip(info.project.name === 'celular', 'Basta con el escritorio');
  test.setTimeout(120_000);
  await page.goto('/estudio?carga');
  const carga = page.getByRole('dialog', { name: 'Preparando Impromptu' });
  await expect(carga).toBeVisible({ timeout: 20_000 });
  await expect(carga).toContainText('Piano');
  await carga.getByRole('button', { name: 'Seguir sin esperar' }).click();
  await expect(carga).toBeHidden();
  // La descarga sigue y se ve en la burbuja.
  const burbuja = page.getByRole('button', { name: /trabajos en segundo plano/ });
  await expect(burbuja).toBeVisible();
  await burbuja.click();
  await expect(page.getByRole('list', { name: 'Trabajos en segundo plano' })).toContainText(
    'Descargando: Piano',
  );
});
