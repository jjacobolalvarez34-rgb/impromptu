// Exporta la animación del logo (/intro) a MP4, cuadro por cuadro y sin saltos.
// Uso: pnpm intro:mp4 [ancho] [alto] [fps]    (por defecto 1920 1080 60)
// Necesita el servidor de desarrollo en http://localhost:5173 y ffmpeg en el PATH.
// Todo se escribe en D: (regla del equipo): cuadros en D:\.cache y video en exports/.
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const [width = 1920, height = 1080, fps = 60] = process.argv.slice(2).map(Number);
const HOLD_MS = 1200; // el ícono final queda quieto un momento
const frames = 'D:/.cache/claude-tmp/intro-frames';
const outDir = fileURLToPath(new URL('../exports/', import.meta.url));
const out = `${outDir}impromptu-intro-${width}x${height}-${fps}fps.mp4`;

rmSync(frames, { recursive: true, force: true });
mkdirSync(frames, { recursive: true });
mkdirSync(outDir, { recursive: true });

// El Chromium completo: la versión ligera (headless shell) se traba con esta página.
const browser = await chromium.launch({ channel: 'chromium' });
try {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto('http://localhost:5173/intro?video', { timeout: 300_000 });
  await page.evaluate(() => document.fonts.ready.then(() => true));
  // Espera a que el componente arranque sus animaciones y las congela todas en 0.
  await page.waitForFunction(() => document.getAnimations().length > 0, null, { timeout: 10_000 });
  const total = await page.evaluate(() => {
    const anims = document.getAnimations();
    for (const a of anims) a.pause();
    return Math.max(...anims.map((a) => Number(a.effect?.getComputedTiming().endTime ?? 0)));
  });

  const count = Math.ceil(((total + HOLD_MS) / 1000) * fps);
  for (let i = 0; i < count; i++) {
    const t = Math.min((i / fps) * 1000, total);
    await page.evaluate((ms) => {
      for (const a of document.getAnimations()) a.currentTime = ms;
    }, t);
    await page.screenshot({
      path: `${frames}/f${String(i).padStart(5, '0')}.png`,
      timeout: 120_000,
    });
    if (i % fps === 0) console.log(`cuadro ${i}/${count}`);
  }

  execFileSync(
    'ffmpeg',
    [
      '-y',
      '-loglevel',
      'error',
      '-framerate',
      String(fps),
      '-i',
      `${frames}/f%05d.png`,
      '-c:v',
      'libx264',
      '-preset',
      'slow',
      '-crf',
      '14',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      out,
    ],
    { stdio: 'inherit' },
  );
  console.log(`Listo: ${out} (${(count / fps).toFixed(2)} s)`);
} finally {
  await browser.close();
  rmSync(frames, { recursive: true, force: true });
}
