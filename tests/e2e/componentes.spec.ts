import { expect, test } from '@playwright/test';

test.describe('/componentes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/componentes');
    // Devuelve solo el estado: el FontFaceSet completo no se puede serializar.
    const fuentes = await page.evaluate(() => document.fonts.ready.then((f) => f.status));
    expect(fuentes).toBe('loaded');
  });

  test('muestra todos los componentes de DESIGN §4 y toma captura', async ({ page }, info) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Componentes' })).toBeVisible();
    for (const seccion of ['Logo', 'Color', 'Tipografía', 'Componentes']) {
      await expect(page.getByRole('heading', { level: 2, name: seccion })).toBeVisible();
    }

    await expect(page.getByRole('img', { name: 'impromptu' }).first()).toBeVisible();
    await expect(page.getByRole('img', { name: 'Ícono de Impromptu' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Grabar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Exportar video' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reproducir' })).toBeVisible();
    await expect(page.getByText('01:24.36').first()).toBeVisible();
    await expect(page.getByRole('switch', { name: 'Números de dedo' })).toBeVisible();
    await expect(page.getByRole('radiogroup', { name: 'Formato' })).toBeVisible();
    await expect(page.getByRole('tablist', { name: 'Secciones' })).toBeVisible();
    await expect(page.getByRole('slider', { name: 'Chispas al tocar' })).toBeVisible();
    await expect(page.getByText('PSR-E343')).toBeVisible();

    await page.screenshot({
      path: `test-results/capturas/componentes-${info.project.name}.png`,
      fullPage: true,
    });
  });

  test('las fuentes se cargan del paquete, no de internet', async ({ page }) => {
    const fuentes = await page.evaluate(() =>
      ['Martian Mono', 'Archivo'].map((f) => document.fonts.check(`16px "${f}"`)),
    );
    expect(fuentes).toEqual([true, true]);
  });

  test('un solo botón principal por vista', async ({ page }) => {
    // El botón principal es el único con fondo --chasis.
    const principales = await page
      .locator('button')
      .evaluateAll(
        (botones) =>
          botones.filter((b) => getComputedStyle(b).backgroundColor === 'rgb(232, 228, 220)')
            .length,
      );
    expect(principales).toBe(1);
  });

  test('no hay desplazamiento horizontal', async ({ page }) => {
    const desborde = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(desborde).toBeLessThanOrEqual(0);
  });

  test('se usa con teclado: foco visible y controles operables', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Foco medido solo en Chromium');

    const grabar = page.getByRole('button', { name: 'Grabar' });
    await grabar.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(grabar).toBeFocused();
    const contorno = await grabar.evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        style: s.outlineStyle,
        width: s.outlineWidth,
        color: s.outlineColor,
        offset: s.outlineOffset,
      };
    });
    expect(contorno).toEqual({
      style: 'solid',
      width: '2px',
      color: 'rgb(255, 159, 28)',
      offset: '2px',
    });

    const dedos = page.getByRole('switch', { name: 'Números de dedo' });
    await dedos.focus();
    await expect(dedos).toHaveAttribute('aria-checked', 'true');
    await page.keyboard.press('Space');
    await expect(dedos).toHaveAttribute('aria-checked', 'false');

    await page.getByRole('radio', { name: 'Horizontal 16:9' }).focus();
    await page.keyboard.press('ArrowRight');
    const vertical = page.getByRole('radio', { name: 'Vertical 9:16' });
    await expect(vertical).toBeFocused();
    await expect(vertical).toHaveAttribute('aria-checked', 'true');

    await page.getByRole('tab', { name: 'Estudio' }).focus();
    await page.keyboard.press('End');
    await expect(page.getByRole('tab', { name: 'En vivo' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.getByRole('tabpanel')).toHaveText('Vista: En vivo');

    const chispas = page.getByRole('slider', { name: 'Chispas al tocar' });
    await chispas.focus();
    await page.keyboard.press('ArrowRight');
    await expect(chispas).toHaveValue('63');
  });

  test('toques de 44 px en celular', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Solo aplica a pantallas táctiles');
    const alturas = await page
      .locator('button:not([role="switch"]), input[type="range"]')
      .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
    expect(Math.min(...alturas)).toBeGreaterThanOrEqual(44);
  });
});

test('la PWA declara su manifiesto e ícono', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.getByRole('img', { name: 'impromptu' })).toBeVisible();
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).toBeTruthy();
  const manifest = await (await request.get(href ?? '')).json();
  expect(manifest).toMatchObject({ name: 'Impromptu', lang: 'es', theme_color: '#1C1C1A' });
  for (const icon of manifest.icons as { src: string }[]) {
    expect((await request.get(`/${icon.src}`)).ok()).toBe(true);
  }
  expect((await request.get('/icon.svg')).ok()).toBe(true);
});
