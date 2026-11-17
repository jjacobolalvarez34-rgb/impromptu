# App de escritorio (Windows)

La web de Impromptu empaquetada con Electron (ADR-018). Todo queda en D:
(`D:\.cache\electron`, `D:\.cache\electron-builder`).

- `pnpm --filter @impromptu/desktop dev`: compila la web y abre la app.
- `pnpm --filter @impromptu/desktop dist`: arma el instalador en `apps/desktop/release/`,
  con el modelo de piano adentro (sin internet).

La app sirve la web por `app://impromptu/` con COOP/COEP (hilos para el modelo de piano),
permite MIDI, micrófono y cámara, y trae el menú Archivo, Editar, Ver y Ayuda.
