import { BrowserWindow, Menu, app, net, protocol, session, shell } from 'electron';
import type { MenuItemConstructorOptions } from 'electron';
import { existsSync } from 'node:fs';
import { join, normalize, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * App de escritorio de Impromptu (ADR-018): la web compilada servida por un protocolo propio,
 * con aislamiento entre orígenes (el modelo de piano usa varios hilos), permisos de MIDI,
 * micrófono y cámara, y el menú Archivo (DESIGN §5).
 */
const SCHEME = 'app';
const HOST = 'impromptu';
const START = `${SCHEME}://${HOST}/estudio?intro`;

/** Carpetas de la web compilada y de los modelos: dentro del instalador, o del repositorio en desarrollo. */
const webDir = app.isPackaged
  ? join(process.resourcesPath, 'web')
  : join(__dirname, '..', '..', 'web', 'dist');
const modelsDir = app.isPackaged
  ? join(process.resourcesPath, 'modelos')
  : (process.env.IMPROMPTU_MODELS ?? 'D:/.cache/models');

// La tarjeta gráfica de equipos viejos (Intel HD 4600) puede estar en la lista de bloqueo de
// Chromium: sin ella, las animaciones y el visualizador se dibujan por software y se traban.
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-gpu-rasterization');

protocol.registerSchemesAsPrivileged([
  {
    scheme: SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
      codeCache: true,
    },
  },
]);

/** Cabeceras para que la página quede aislada (SharedArrayBuffer, hilos de WASM). */
const ISOLATION = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'credentialless',
};

/** Ruta segura dentro de `root`, o null si intenta salir de ella. */
function inside(root: string, rel: string): string | null {
  const full = normalize(join(root, rel));
  return full.startsWith(normalize(root + sep)) || full === normalize(root) ? full : null;
}

function serve(): void {
  protocol.handle(SCHEME, async (request) => {
    const url = new URL(request.url);
    const path = decodeURIComponent(url.pathname);
    let file: string | null;
    if (path.startsWith('/modelos/')) file = inside(modelsDir, path.slice('/modelos/'.length));
    else {
      file = inside(webDir, path.slice(1));
      // Rutas de la app (SPA): cualquier ruta sin archivo abre index.html.
      if (!file || !existsSync(file) || !/\.[a-z0-9]+$/i.test(path))
        file = join(webDir, 'index.html');
    }
    if (!file || !existsSync(file)) return new Response('No encontrado', { status: 404 });
    const response = await net.fetch(pathToFileURL(file).toString());
    const headers = new Headers(response.headers);
    for (const [k, v] of Object.entries(ISOLATION)) headers.set(k, v);
    if (file.endsWith('.wasm')) headers.set('Content-Type', 'application/wasm');
    if (file.endsWith('.mjs') || file.endsWith('.js'))
      headers.set('Content-Type', 'text/javascript');
    return new Response(response.body, { status: response.status, headers });
  });
}

/** MIDI (teclado por USB), micrófono y cámara: permitidos sin preguntar, como en una app instalada. */
function permissions(): void {
  const allowed = new Set([
    'midi',
    'midiSysex',
    'media',
    'fullscreen',
    'clipboard-sanitized-write',
  ]);
  session.defaultSession.setPermissionRequestHandler((_wc, permission, callback) =>
    callback(allowed.has(permission)),
  );
  session.defaultSession.setPermissionCheckHandler((_wc, permission) => allowed.has(permission));
}

/** Avisa a la página que se eligió una opción del menú (la página hace el resto). */
const send = (win: BrowserWindow, action: string) => () =>
  win.webContents.send('impromptu:menu', action);

function menu(win: BrowserWindow): void {
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'Archivo',
      submenu: [
        { label: 'Abrir MIDI…', accelerator: 'CmdOrCtrl+O', click: send(win, 'abrir-midi') },
        { label: 'Convertir un audio (MP3 a MIDI)…', click: send(win, 'convertir-audio') },
        { type: 'separator' },
        { label: 'Guardar MIDI', accelerator: 'CmdOrCtrl+S', click: send(win, 'guardar-midi') },
        {
          label: 'Exportar video…',
          accelerator: 'CmdOrCtrl+E',
          click: send(win, 'exportar-video'),
        },
        { type: 'separator' },
        {
          label: 'Abrir la carpeta de descargas',
          click: () => void shell.openPath(app.getPath('downloads')),
        },
        { type: 'separator' },
        { label: 'Salir', role: 'quit' },
      ],
    },
    {
      label: 'Editar',
      submenu: [
        { label: 'Deshacer', accelerator: 'CmdOrCtrl+Z', click: send(win, 'deshacer') },
        { label: 'Rehacer', accelerator: 'CmdOrCtrl+Y', click: send(win, 'rehacer') },
      ],
    },
    {
      label: 'Ver',
      submenu: [
        { label: 'Estudio', accelerator: 'CmdOrCtrl+1', click: send(win, 'ver-estudio') },
        { label: 'Partitura', accelerator: 'CmdOrCtrl+2', click: send(win, 'ver-partitura') },
        { type: 'separator' },
        { label: 'Pantalla completa', role: 'togglefullscreen' },
        { label: 'Recargar', role: 'reload' },
        { label: 'Herramientas de desarrollo', role: 'toggleDevTools' },
      ],
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Acerca de Impromptu',
          click: () => void win.loadURL(`${SCHEME}://${HOST}/acerca`),
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    title: 'Impromptu',
    backgroundColor: '#1C1C1A',
    icon: join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: {
      preload: join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      sandbox: true,
    },
  });
  menu(win);
  // Enlaces a otros sitios (GitHub, el correo de la empresa): en el navegador del sistema.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(`${SCHEME}://`)) void shell.openExternal(url);
    return { action: 'deny' };
  });
  void win.loadURL(START);
}

app.whenReady().then(() => {
  serve();
  permissions();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
