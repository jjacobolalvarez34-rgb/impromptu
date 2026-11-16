// Genera los PNG de la PWA (192 y 512 px) a partir de assets/brand/icon.svg.
// Uso: pnpm brand:icons  (necesita Chromium de Playwright instalado).
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const brand = fileURLToPath(new URL('../assets/brand/', import.meta.url));
const svg = await readFile(`${brand}icon.svg`, 'utf8');

const browser = await chromium.launch();
try {
  for (const size of [192, 512]) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.setContent(
      `<style>html,body{margin:0;background:transparent}svg{display:block;width:${size}px;height:${size}px}</style>${svg}`,
    );
    await page
      .locator('svg')
      .screenshot({ path: `${brand}icon-${size}.png`, omitBackground: true });
    await page.close();
    console.log(`icon-${size}.png`);
  }
} finally {
  await browser.close();
}
