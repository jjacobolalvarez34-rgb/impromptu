import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Fase 11 (gráficos): capturas de la guitarra y la batería con las piezas de prueba, para
 * revisar a ojo los números de traste, las gemas de la batería y lo demás de esta fase.
 */
async function abrirPrueba(page: Page, nombre: RegExp, instrumento: RegExp, desde = 0) {
  await page.goto('/estudio');
  await page.getByRole('button', { name: nombre }).filter({ hasText: instrumento }).first().click();
  await expect(page.getByRole('button', { name: /Reproducir/ }).first()).toBeEnabled();
  // Ir a un momento de la pieza con la línea de tiempo (Mayús + → avanza 10 s, → 2 s).
  if (desde > 0) {
    await page.getByRole('slider', { name: /Línea de tiempo/ }).focus();
    for (let s = 0; s + 10 <= desde; s += 10) await page.keyboard.press('Shift+ArrowRight');
    for (let s = 0; s + 2 <= desde % 10; s += 2) await page.keyboard.press('ArrowRight');
  }
  // Que suene un rato: las notas quedan cerca del mástil o de los parches.
  await page.getByRole('button', { name: 'Reproducir', exact: true }).click();
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: 'Pausar', exact: true }).click();
  await page.waitForTimeout(300);
}

test('guitarra: números de traste legibles', async ({ page }, info) => {
  test.skip(info.project.name === 'celular', 'Capturas de escritorio');
  test.setTimeout(120_000);
  // Al final de la pieza hay rasgueos: flechas hacia abajo (ámbar) y hacia arriba (verde).
  await abrirPrueba(page, /arpegios/, /Guitarra/, 22);
  await page.screenshot({ path: 'test-results/capturas/fase11-guitarra.png' });
});

test('batería: golpes como gemas que no se pegan', async ({ page }, info) => {
  test.skip(info.project.name === 'celular', 'Capturas de escritorio');
  test.setTimeout(120_000);
  await page.goto('/estudio');
  // El pulso del tempo en la esquina (pedido 18), con la opción de que suene.
  await page.getByRole('switch', { name: 'Pulso en una esquina' }).click();
  await expect(page.getByRole('switch', { name: 'Que suene el pulso' })).toBeVisible();
  await abrirPrueba(page, /rock/, /Batería/);
  await page.screenshot({ path: 'test-results/capturas/fase11-bateria.png' });

  // Vista de batería real (pedido 17): cada pieza en su lugar.
  await page.getByRole('radio', { name: 'Batería real' }).click();
  await expect(page.getByText('Cada pieza está donde va en una batería')).toBeVisible();
  await page.getByRole('button', { name: 'Reproducir', exact: true }).click();
  await page.waitForTimeout(1500);
  await page.getByRole('button', { name: 'Pausar', exact: true }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'test-results/capturas/fase11-bateria-real.png' });
});

test('batería: el hi-hat abierto se ve hueco y el cerrado lleno', async ({ page }, info) => {
  test.skip(info.project.name === 'celular', 'Capturas de escritorio');
  test.setTimeout(120_000);
  await abrirPrueba(page, /funk/, /Batería/);
  await page.screenshot({ path: 'test-results/capturas/fase11-hihat.png' });
});
