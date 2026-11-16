import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  // En el portátil de Jacobo dos navegadores a la vez saturan la máquina.
  workers: process.env.CI ? 2 : 1,
  // La primera carga en frío (fuentes + service worker) tarda en equipos lentos.
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    // El service worker precarga todo en la primera visita y compite con la prueba.
    // El manifiesto de la PWA se prueba aparte, sin necesitar el worker.
    serviceWorkers: 'block',
  },
  projects: [
    {
      name: 'escritorio',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    { name: 'celular', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
  // Se prueba el build de producción (con el service worker de la PWA), no el servidor de desarrollo.
  webServer: {
    command: `pnpm --filter @impromptu/web build && pnpm --filter @impromptu/web preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
