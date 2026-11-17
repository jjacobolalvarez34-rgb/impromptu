import { copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// El ícono vive una sola vez en assets/brand (DESIGN §1) y se sirve como carpeta pública.
const brandDir = fileURLToPath(new URL('../../assets/brand', import.meta.url));

/**
 * Ruta base donde se publica la app. En GitHub Pages es /impromptu/ (VITE_BASE en el
 * flujo de despliegue); en local y en las pruebas, la raíz.
 */
const base = process.env.VITE_BASE ?? '/';

/**
 * GitHub Pages no sabe de rutas de una SPA: al recargar /impromptu/estudio devolvería 404.
 * Copiar index.html como 404.html hace que cualquier ruta abra la app.
 */
function spaFallback(): Plugin {
  let outDir = 'dist';
  return {
    name: 'impromptu-spa-404',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    closeBundle() {
      copyFileSync(`${outDir}/index.html`, `${outDir}/404.html`);
    },
  };
}

export default defineConfig({
  base,
  publicDir: brandDir,
  plugins: [
    react(),
    spaFallback(),
    VitePWA({
      // PROVISIONAL: el aviso "Hay una versión nueva. Recargar" (BUGS B-016) queda pendiente.
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Impromptu',
        short_name: 'Impromptu',
        description: 'Videos de piano con notas cayendo, gratis y open source.',
        lang: 'es',
        // La app instalada abre directo en la app, no en la presentación.
        start_url: `${base}app`,
        scope: base,
        display: 'standalone',
        theme_color: '#1C1C1A',
        background_color: '#1C1C1A',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        // Incluye el modelo de transcripción (json + bin) para que funcione sin conexión.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json,bin}'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        navigateFallback: `${base}index.html`,
      },
    }),
  ],
  // El worker de transcripción usa módulos ES (importa TensorFlow.js y el modelo).
  worker: { format: 'es' },
  server: { port: 5173 },
  preview: { port: 4173 },
});
