import { expect, test } from '@playwright/test';

/**
 * Fase 10: grabar directo en la partitura. Un teclado MIDI de mentira (Web MIDI simulado)
 * toca una escala; la hoja se escribe mientras se graba y, al parar, queda abierta la toma.
 */
test('grabar en la partitura escribe la hoja mientras se toca', async ({ page }, info) => {
  test.skip(info.project.name === 'celular', 'La partitura está en el estudio de escritorio');
  test.setTimeout(120_000);
  await page.addInitScript(() => {
    type Escucha = ((e: { data: Uint8Array; timeStamp: number }) => void) | null;
    const entrada = {
      id: 'falso-1',
      name: 'Teclado de prueba',
      manufacturer: 'Impromptu',
      state: 'connected',
      connection: 'open',
      type: 'input',
      onmidimessage: null as Escucha,
    };
    const acceso = {
      inputs: new Map([[entrada.id, entrada]]),
      outputs: new Map(),
      sysexEnabled: false,
      onstatechange: null,
    };
    Object.defineProperty(navigator, 'requestMIDIAccess', {
      value: () => Promise.resolve(acceso),
    });
    const consultar = navigator.permissions.query.bind(navigator.permissions);
    navigator.permissions.query = ((d: PermissionDescriptor) =>
      (d.name as string) === 'midi'
        ? Promise.resolve({ state: 'granted' } as PermissionStatus)
        : consultar(d)) as typeof navigator.permissions.query;
    (window as unknown as { tocar: (p: number, on: boolean) => void }).tocar = (p, on) =>
      entrada.onmidimessage?.({
        data: new Uint8Array(on ? [0x90, p, 90] : [0x80, p, 0]),
        timeStamp: performance.now(),
      });
  });

  await page.goto('/estudio');
  await page.getByRole('tab', { name: 'Partitura' }).click();
  const panel = page.getByRole('complementary', { name: 'Ajustes de la partitura' });
  const grabar = panel.getByRole('button', { name: 'Grabar en la partitura' });
  await expect(grabar).toBeEnabled({ timeout: 20_000 });
  await grabar.click();
  await expect(panel.getByText(/la hoja se escribe sola/)).toBeVisible();

  const tocar = (p: number, on: boolean) =>
    page.evaluate(
      ([n, o]) =>
        (window as unknown as { tocar: (p: number, on: boolean) => void }).tocar(
          n as number,
          o as boolean,
        ),
      [p, on],
    );
  for (const p of [60, 62, 64, 65, 67]) {
    await tocar(p, true);
    await page.waitForTimeout(300);
    await tocar(p, false);
  }
  // Mientras se graba, la hoja ya muestra notas (cabezas de nota de VexFlow).
  const hoja = page.getByRole('main', { name: /Partitura de/ });
  await expect(hoja.locator('.vf-notehead').first()).toBeVisible({ timeout: 10_000 });
  await page.screenshot({ path: 'test-results/grabar-hoja.png' });

  await panel.getByRole('button', { name: 'Parar y abrir' }).click();
  await expect(page.getByRole('main', { name: /Partitura de Toma \d+/ })).toBeVisible({
    timeout: 20_000,
  });
  await expect(panel.getByRole('button', { name: 'Grabar en la partitura' })).toBeVisible();
});
