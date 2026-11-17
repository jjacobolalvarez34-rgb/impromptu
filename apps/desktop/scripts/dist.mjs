// Instalador de Windows: web compilada + modelo de piano (sin internet) + Electron.
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { desktopEnv } from './env.mjs';

const run = (cmd, args, cwd) => {
  const r = spawnSync(cmd, args, { stdio: 'inherit', env: desktopEnv, cwd, shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
};
const models = process.env.IMPROMPTU_MODELS ?? 'D:/.cache/models';
mkdirSync('modelos', { recursive: true });
if (existsSync(models)) {
  for (const f of readdirSync(models).filter((n) => n.startsWith('transkun-'))) {
    copyFileSync(join(models, f), join('modelos', f));
  }
} else {
  process.stderr.write(`Sin modelos en ${models}: el instalador saldrá sin el modelo de piano.
`);
}
run('pnpm', ['--filter', '@impromptu/web', 'build'], '../..');
run('pnpm', ['run', 'electron:get']);
run('pnpm', ['run', 'compile']);
run('npx', ['electron-builder', '--win', '--x64']);
