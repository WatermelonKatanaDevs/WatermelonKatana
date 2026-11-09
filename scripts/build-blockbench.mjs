import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve('Editor/vendor/blockbench');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

if (!existsSync(resolve(root, 'package.json'))) {
  console.error('Blockbench submodule is missing. Run: git submodule update --init --recursive');
  process.exit(1);
}

function run(args) {
  const result = spawnSync(npm, args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

run(['ci', '--include=dev', '--ignore-scripts']);
run(['run', 'build-web']);
