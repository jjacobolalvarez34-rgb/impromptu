// Todo en D: (regla del proyecto): binario de Electron y cachés de electron-builder.
// Si se lanza desde VS Code (que es Electron), ELECTRON_RUN_AS_NODE haría arrancar a Electron
// como Node, sin ventana: se quita.
const inherited = { ...process.env };
delete inherited.ELECTRON_RUN_AS_NODE;

export const desktopEnv = {
  ...inherited,
  ELECTRON_CACHE: process.env.ELECTRON_CACHE ?? 'D:/.cache/electron',
  electron_config_cache: process.env.electron_config_cache ?? 'D:/.cache/electron',
  ELECTRON_BUILDER_CACHE: process.env.ELECTRON_BUILDER_CACHE ?? 'D:/.cache/electron-builder',
  // La web compilada para la app busca el modelo de piano en app://impromptu/modelos/.
  VITE_PIANO_MODEL_URL: '/modelos/',
};
