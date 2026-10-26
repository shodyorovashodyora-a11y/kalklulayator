import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const androidDir = path.join(projectRoot, 'android');
const gradleWrapper = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const result = spawnSync(gradleWrapper, ['--no-daemon', 'bundleRelease'], {
  cwd: androidDir,
  env: process.env,
  shell: process.platform === 'win32',
  stdio: 'inherit',
});

if (result.error) {
  throw new Error(`Gradle build could not be started: ${result.error.message}`, {
    cause: result.error,
  });
}

process.exit(result.status ?? 1);
