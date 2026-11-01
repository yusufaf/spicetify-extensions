// Syntax-checks every extension in manifest.json and runs its unit tests, if it has any.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifests = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));

let failed = false;
const run = (args) => {
  const result = spawnSync(process.execPath, args, { cwd: root, stdio: 'inherit' });
  if (result.status !== 0) failed = true;
};

for (const { main } of manifests) {
  run(['--check', main]);
  const testDir = join(root, dirname(main), 'test');
  if (!existsSync(testDir)) continue;
  const files = readdirSync(testDir).filter((f) => f.endsWith('.test.js')).map((f) => join(testDir, f));
  if (files.length) run(['--test', ...files]);
}

process.exit(failed ? 1 : 0);
