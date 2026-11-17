import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// El ícono vive una sola vez en assets/brand (DESIGN §1) y se sirve como carpeta pública.
const brandDir = fileURLToPath(new URL('../../assets/brand', import.meta.url));

export default defineConfig({
  publicDir: brandDir,
  plugins: [
    react(),
    VitePWA({
      // PROVISIONAL: el aviso "Hay una versión nueva. Recargar" (BUGS B-016) llega con el despliegue, fase 3.
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Impromptu',
        short_name: 'Impromptu',
        description: 'Videos de piano con notas cayendo, gratis y open source.',
        lang: 'es',
        start_url: '/app',
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
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
      },
    }),
  ],
  server: { port: 5173 },
  preview: { port: 4173 },
});
