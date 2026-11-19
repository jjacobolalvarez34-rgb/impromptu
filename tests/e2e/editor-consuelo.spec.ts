import { existsSync, readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

/**
 * Error que vio Jacobo (2026-11-19) con "Consuelo": al tocar una nota de la hoja se elegía otra.
 * Usa su pieza de fixtures/jacobo (fuera de git): si no está, la prueba se salta.
 */
const PIEZA = 'fixtures/jacobo/consuelo.mid';

test('en una pieza real, tocar una nota elige esa misma nota', async ({ page }, info) => {
  test.skip(info.project.name === 'celular' || !existsSync(PIEZA), 'Solo en el equipo de Jacobo');
  test.setTimeout(180_000);
  await page.goto('/estudio?instrumento=piano');
  await page.locator('input[accept=".mid,.midi,audio/midi"]').setInputFiles({
    name: 'consuelo.mid',
    mimeType: 'audio/midi',
    buffer: readFileSync(PIEZA),
  });
  await page.getByRole('tab', { name: 'Partitura' }).click();
  await page.getByRole('radio', { name: '3/4' }).click();
  await expect(page.locator('[data-compas="1"]').first()).toBeVisible({ timeout: 90_000 });
  const malas: string[] = [];
  for (const compas of [0, 1, 2, 3, 4]) {
    for (const pentagrama of [0, 1]) {
      const cabezas = page.locator(
        `[data-compas="${compas}"][data-pentagrama="${pentagrama}"] .vf-notehead`,
      );
      const n = await cabezas.count();
      for (let i = 0; i < n; i++) {
        const cabeza = cabezas.nth(i);
        const caja = await cabeza.boundingBox();
        if (!caja) continue;
        await page.mouse.click(caja.x + caja.width / 2, caja.y + caja.height / 2);
        const bien = await cabeza.evaluate((el) => !!el.closest('.impromptu-elegida'));
        if (!bien) {
          const elegida = await page
            .locator('.impromptu-elegida')
            .first()
            .evaluate(
              (el) => `${(el as HTMLElement).dataset.compas}/${(el as HTMLElement).dataset.inicio}`,
            )
            .catch(() => 'ninguna');
          malas.push(
            `compás ${compas}, pentagrama ${pentagrama}, cabeza ${i} → elegida ${elegida}`,
          );
        }
      }
    }
  }
  expect(malas).toEqual([]);

  // Editar: subir un semitono la nota tocada debe cambiar esa misma nota (en su mismo lugar).
  const barra = page.getByRole('toolbar', { name: 'Editar la partitura' });
  const editadas: string[] = [];
  for (const compas of [1, 2]) {
    const sel = `[data-compas="${compas}"][data-pentagrama="1"] .vf-notehead`;
    const n = Math.min(4, await page.locator(sel).count());
    for (let i = 0; i < n; i++) {
      const caja = await page.locator(sel).nth(i).boundingBox();
      if (!caja) continue;
      await page.mouse.click(caja.x + caja.width / 2, caja.y + caja.height / 2);
      const antes = await barra.getByRole('status').textContent();
      await page.keyboard.press('ArrowUp');
      await expect(barra.getByRole('status')).not.toHaveText(antes ?? '');
      await page.waitForTimeout(400);
      const elegida = await page.locator('.impromptu-elegida .vf-notehead').first().boundingBox();
      const despues = await barra.getByRole('status').textContent();
      const corrida = elegida ? Math.abs(elegida.x - caja.x) : Infinity;
      editadas.push(`c${compas} n${i}: ${antes} → ${despues}, corrida ${Math.round(corrida)} px`);
      await page.keyboard.press('Control+z');
      await page.waitForTimeout(400);
    }
  }
  // eslint-disable-next-line no-console
  console.log(editadas.join('\n'));
  expect(editadas.filter((e) => !/corrida [0-9] px$/.test(e))).toEqual([]);
});
