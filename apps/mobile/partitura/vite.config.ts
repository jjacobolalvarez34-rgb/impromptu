import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// Arma la partitura (notación + OpenSheetMusicDisplay) dentro de los assets de la app.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  base: './',
  build: {
    outDir: fileURLToPath(new URL('../app/src/main/assets/partitura', import.meta.url)),
    emptyOutDir: true,
    chunkSizeWarningLimit: 4000,
  },
});
