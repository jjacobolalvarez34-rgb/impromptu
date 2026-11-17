// APK de prueba (debug), para instalar en el celular de Jacobo.
import { spawnSync } from 'node:child_process';
import { androidEnv } from './env.mjs';

const run = (cmd, args, cwd) => {
  const r = spawnSync(cmd, args, { stdio: 'inherit', env: androidEnv, cwd, shell: true });
  if (r.status !== 0) process.exit(r.status ?? 1);
};
run('node', ['scripts/sync.mjs']);
run('gradlew.bat', ['assembleDebug', '--no-daemon'], 'android');
console.log('APK: apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk');
