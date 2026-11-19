import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Fase 11 (gráficos): capturas de la guitarra y la batería con las piezas de prueba, para
 * revisar a ojo los números de traste, las gemas de la batería y lo demás de esta fase.
 */
async function abrirPrueba(page: Page, nombre: RegExp, instrumento: RegExp) {
  await page.goto('/estudio');
  await page.getByRole('button', { name: nombre }).filter({ hasText: instrumento }).first().click();
  await expect(page.getByRole('button', { name: /Reproducir/ }).first()).toBeEnabled();
  // Que suene un rato: las notas quedan cerca del mástil o de los parches.
  await page.keyboard.press('Space');
  await page.waitForTimeout(2500);
  await page.keyboard.press('Space');
  await page.waitForTimeout(300);
}

test('guitarra: números de traste legibles', async ({ page }, info) => {
  test.skip(info.project.name === 'celular', 'Capturas de escritorio');
  await abrirPrueba(page, /arpegios/, /Guitarra/);
  await page.screenshot({ path: 'test-results/capturas/fase11-guitarra.png' });
});

test('batería: golpes como gemas que no se pegan', async ({ page }, info) => {
  test.skip(info.project.name === 'celular', 'Capturas de escritorio');
  await abrirPrueba(page, /rock/, /Batería/);
  await page.screenshot({ path: 'test-results/capturas/fase11-bateria.png' });
});
