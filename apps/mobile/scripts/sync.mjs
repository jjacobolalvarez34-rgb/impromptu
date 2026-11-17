// Compila la web, la copia a www/ (con el modelo de piano) y la pasa al proyecto de Android.
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { androidEnv } from './env.mjs';

const run = (cmd, args, cwd) => {
  const r = spawnSync(cmd, args, { stdio: 'inherit', env: androidEnv, cwd, shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
};
mkdirSync('D:/.cache/gradle/tmp', { recursive: true });
run('pnpm', ['--filter', '@impromptu/web', 'build'], '../..');
rmSync('www', { recursive: true, force: true });
cpSync('../web/dist', 'www', { recursive: true });
const models = process.env.IMPROMPTU_MODELS ?? 'D:/.cache/models';
if (existsSync(models)) {
  mkdirSync('www/modelos', { recursive: true });
  for (const f of readdirSync(models).filter((n) => n.startsWith('transkun-'))) {
    copyFileSync(join(models, f), join('www/modelos', f));
  }
}
run('npx', ['cap', existsSync('android') ? 'sync' : 'add', 'android']);
