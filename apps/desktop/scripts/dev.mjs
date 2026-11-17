// Prueba local de la app de escritorio: compila la web y el proceso principal y abre Electron.
import { spawnSync, spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { desktopEnv } from './env.mjs';

const run = (cmd, args, cwd) => {
  const r = spawnSync(cmd, args, { stdio: 'inherit', env: desktopEnv, cwd, shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
};
run('pnpm', ['--filter', '@impromptu/web', 'build'], '../..');
run('pnpm', ['run', 'electron:get']);
run('pnpm', ['run', 'compile']);
const require = createRequire(import.meta.url);
const electron = require('electron');
spawn(electron, ['.'], { stdio: 'inherit', env: desktopEnv }).on('exit', (c) =>
  process.exit(c ?? 0),
);
