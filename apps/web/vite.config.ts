import {
  copyFileSync,
  cpSync,
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
 * Sonidos grabados de guitarra, bajo y batería (apps/web/public/instrumentos y /bateria). La
 * carpeta pública de Vite es la de la marca, así que estos se sirven y se copian aparte
 * (BUG-007: antes /bateria/ no llegaba al navegador y la batería sonaba sintetizada).
 */
const sonidosDir = fileURLToPath(new URL('./public', import.meta.url));
const CARPETAS_SONIDO = ['instrumentos', 'bateria'];
const RUTA_SONIDO = /\/(instrumentos|bateria)\/([\w-]+\/)?([\w.-]+\.(flac|json))$/;

function sonidos(): Plugin {
  let outDir = 'dist';
  return {
    name: 'impromptu-sonidos',
    configResolved(config) {
      outDir = config.build.outDir;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const ruta = decodeURIComponent((req.url ?? '').split('?')[0] ?? '');
        const m = RUTA_SONIDO.exec(ruta);
        if (!m) return next();
        const file = join(sonidosDir, m[1]!, m[2] ?? '', m[3]!);
        if (!existsSync(file)) return next();
        res.setHeader('Content-Type', m[4] === 'json' ? 'application/json' : 'audio/flac');
        res.setHeader('Content-Length', String(statSync(file).size));
        createReadStream(file).pipe(res);
      });
    },
    closeBundle() {
      for (const c of CARPETAS_SONIDO) {
        cpSync(join(sonidosDir, c), join(outDir, c), { recursive: true });
      }
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
        if (!/\.(onnx|f32|json)$/.test(file) || !existsSync(file)) return next();
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
    sonidos(),
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
        // Sonidos grabados de guitarra, bajo y batería (pedido 25): no se precargan (13 MB);
        // se guardan la primera vez que se usan y después sirven sin conexión.
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              /\/(instrumentos|bateria)\/.+\.(flac|json)$/.test(url.pathname),
            handler: 'CacheFirst',
            options: { cacheName: 'sonidos', expiration: { maxEntries: 400 } },
          },
        ],
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
