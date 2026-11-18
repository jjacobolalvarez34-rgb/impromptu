// APK firmado con la llave de Mamut Herd (D:/Android/keys, fuera del repositorio).
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';

const props = process.env.IMPROMPTU_KEYSTORE ?? 'D:/Android/keys/impromptu-release.properties';
if (!existsSync(props)) {
  process.stderr.write(`Falta la llave de firma (${props}).\n`);
  process.exit(1);
}
const r = spawnSync('node', ['scripts/gradle.mjs', 'assembleRelease'], {
  stdio: 'inherit',
  shell: true,
});
if (r.status !== 0) process.exit(r.status ?? 1);
const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
mkdirSync('release', { recursive: true });
const out = `release/Impromptu-${version}.apk`;
copyFileSync('app/build/outputs/apk/release/app-release.apk', out);
process.stdout.write(`APK firmado: apps/mobile/${out}\n`);
