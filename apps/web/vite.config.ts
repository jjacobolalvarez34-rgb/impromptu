import {
  copyFileSync,
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, join } from 'node:path';
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

/**
 * Modelos grandes de IA (el de piano con pedal, ~154 MB) no van en el repositorio. En desarrollo
 * se sirven desde una carpeta local en /modelos/; en el equipo de Jacobo, D:\.cache\models.
 * PROVISIONAL(P21): dónde se publican para la web y las apps.
 */
const modelsDir = process.env.IMPROMPTU_MODELS ?? 'D:/.cache/models';

function localModels(): Plugin {
  return {
    name: 'impromptu-modelos-locales',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/modelos/', (req, res, next) => {
        const file = join(
          modelsDir,
          basename(decodeURIComponent(req.url ?? '').split('?')[0] ?? ''),
        );
        if (!file.endsWith('.onnx') || !existsSync(file)) return next();
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Length', String(statSync(file).size));
        createReadStream(file).pipe(res);
      });
    },
  };
}

/**
 * Solo en desarrollo: la app guarda parejas MIDI + audio de tomas del teclado en
 * fixtures/jacobo/pares/ (fuera de git), para medir los modelos de audio a notas.
 */
function devPairs(): Plugin {
  const dir = fileURLToPath(new URL('../../fixtures/jacobo/pares', import.meta.url));
  return {
    name: 'impromptu-pares-de-prueba',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/dev/guardar-par', (req, res) => {
        const name = new URL(req.url ?? '', 'http://x').searchParams.get('archivo') ?? '';
        if (req.method !== 'POST' || !/^[\p{L}\p{N} _.-]+$/u.test(name) || name.startsWith('.')) {
          res.statusCode = 400;
          res.end();
          return;
        }
        mkdirSync(dir, { recursive: true });
        const chunks: Buffer[] = [];
        req.on('data', (c: Buffer) => chunks.push(c));
        req.on('end', () => {
          writeFileSync(join(dir, name), Buffer.concat(chunks));
          res.end('ok');
        });
      });
    },
  };
}

/**
 * Aislamiento entre orígenes: el modelo de piano usa varios hilos del procesador
 * (SharedArrayBuffer), que el navegador solo permite con estas cabeceras. "credentialless"
 * deja seguir bajando recursos de otros sitios (las muestras del piano) sin cambios.
 */
const isolation = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'credentialless',
};

/** Versión de la app (package.json), para la pantalla "Acerca de". */
const version = (
  JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
    version: string;
  }
).version;

export default defineConfig({
  base,
  define: { __APP_VERSION__: JSON.stringify(version) },
  publicDir: brandDir,
  plugins: [
    react(),
    spaFallback(),
    localModels(),
    devPairs(),
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
  // onnxruntime-web carga su .wasm con una URL propia: no se preempaqueta.
  optimizeDeps: { exclude: ['onnxruntime-web'] },
  server: { port: 5173, headers: isolation },
  preview: { port: 4173, headers: isolation },
});
