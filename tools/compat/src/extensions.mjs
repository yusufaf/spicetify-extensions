import { readFileSync, existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { MONOREPO_ROOT } from './paths.mjs';

// Every extension listed in the monorepo's root manifest.json (an array, as Marketplace reads it).
// `dir` is the extension's folder and `main` its file name, which is also what Spotify loads.
export function findExtensions(root = MONOREPO_ROOT) {
  const manifestPath = join(root, 'manifest.json');
  if (!existsSync(manifestPath)) return [];
  let manifests;
  try {
    manifests = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch {
    return [];
  }
  if (!Array.isArray(manifests)) manifests = [manifests];
  const found = [];
  for (const manifest of manifests) {
    if (typeof manifest?.main !== 'string' || !manifest.main.endsWith('.js')) continue;
    found.push({
      id: basename(manifest.main, '.js'),
      title: manifest.name ?? basename(manifest.main, '.js'),
      dir: join(root, dirname(manifest.main)),
      main: basename(manifest.main),
    });
  }
  return found.sort((a, b) => a.id.localeCompare(b.id));
}
