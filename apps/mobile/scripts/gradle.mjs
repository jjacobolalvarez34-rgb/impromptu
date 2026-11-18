// Corre Gradle con el entorno en D:. Uso: node scripts/gradle.mjs <tareas…>
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { androidEnv } from './env.mjs';

mkdirSync('D:/.cache/gradle/tmp', { recursive: true });
const r = spawnSync(`"${resolve('gradlew.bat')}"`, [...process.argv.slice(2), '--no-daemon'], {
  stdio: 'inherit',
  env: androidEnv,
  shell: true,
});
process.exit(r.status ?? 1);
