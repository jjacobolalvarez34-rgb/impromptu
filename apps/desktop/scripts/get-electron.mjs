// Baja el binario de Electron (no se baja en pnpm install: el CI no lo necesita). Caché en D:.
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { desktopEnv } from './env.mjs';

const require = createRequire(import.meta.url);
const installer = join(dirname(require.resolve('electron/package.json')), 'install.js');
const r = spawnSync(process.execPath, [installer], { stdio: 'inherit', env: desktopEnv });
process.exit(r.status ?? 1);
