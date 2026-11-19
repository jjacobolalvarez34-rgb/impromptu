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
// Abre en la pantalla principal de la web (intro y elegir instrumento), como pidió Jacobo.
const START = `${SCHEME}://${HOST}/app?intro`;

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

/**
 * Splash screen (pedido 44 de Jacobo, como en osu! o Kdenlive): una ventanita con el logo apenas
 * se abre la app, mientras carga la ventana principal. Va en el código (no en archivos aparte).
 */
const SPLASH = `<!doctype html><html lang="es"><meta charset="utf-8"><style>
html,body{margin:0;height:100%;background:#1C1C1A;color:#E8E4DC;font-family:"Martian Mono",ui-monospace,Consolas,monospace;overflow:hidden}
body{display:grid;place-items:center;transition:opacity .25s ease}
body.fuera{opacity:0}
.caja{display:grid;gap:14px;justify-items:center;animation:entra .5s cubic-bezier(.2,.8,.2,1)}
.marca{font-size:34px;letter-spacing:.02em}.marca b{color:#FF9F1C;font-weight:400}
.teclas{display:flex;gap:2px}.teclas i{width:18px;height:10px;border:1px solid #3D3D39;display:block}
.teclas i:first-child{background:#FF9F1C;border-color:#FF9F1C}
.carga{width:180px;height:2px;background:#3D3D39;overflow:hidden;border-radius:1px}
.carga span{display:block;width:40%;height:100%;background:#FF9F1C;animation:va 1.1s ease-in-out infinite}
p{margin:0;font-size:11px;letter-spacing:.2em;color:#9A968C;text-transform:uppercase}
@keyframes va{from{transform:translateX(-100%)}to{transform:translateX(250%)}}
@keyframes entra{from{opacity:0;transform:translateY(6px)}}
</style><body><div class="caja"><div class="marca"><b>i</b>mpromptu</div>
<div class="teclas"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
<div class="carga"><span></span></div><p>Cargando</p></div></body></html>`;

function createSplash(): BrowserWindow {
  const splash = new BrowserWindow({
    width: 420,
    height: 260,
    frame: false,
    resizable: false,
    movable: true,
    center: true,
    skipTaskbar: true,
    alwaysOnTop: true,
    show: true,
    backgroundColor: '#1C1C1A',
    webPreferences: { sandbox: true, contextIsolation: true },
  });
  void splash.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(SPLASH)}`);
  return splash;
}

function createWindow(): void {
  const abierta = Date.now();
  const splash = createSplash();
  const win = new BrowserWindow({
    // Se muestra cuando ya pintó su primer cuadro; mientras tanto se ve el splash.
    show: false,
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
  win.once('ready-to-show', () => {
    // El splash se ve al menos un momento (si no, parpadea) y se va con un fundido.
    const espera = Math.max(0, 900 - (Date.now() - abierta));
    setTimeout(() => {
      win.show();
      if (splash.isDestroyed()) return;
      void splash.webContents
        .executeJavaScript("document.body.classList.add('fuera')")
        .catch(() => undefined);
      setTimeout(() => {
        if (!splash.isDestroyed()) splash.close();
      }, 260);
    }, espera);
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
