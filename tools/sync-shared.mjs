// Copies each shared/<name> block verbatim into the matching marked region of every
// extension file, so the shipped files stay single-file with no build step.
// `--check` writes nothing and exits 1 if any region differs from its shared source.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const startMarker = (name) => `// @shared ${name} start — edit shared/${name}, then run pnpm sync`;
export const endMarker = (name) => `// @shared ${name} end`;

const MARKER_RE = /^[ \t]*\/\/ @shared (\S+) start\b/gm;

/**
 * Replaces the lines between `name`'s start and end markers with `block`, each
 * non-empty line indented to match the start marker.
 * @param {string} source
 * @param {string} name
 * @param {string} block
 */
export function replaceRegion(source, name, block) {
  const eol = source.includes('\r\n') ? '\r\n' : '\n';
  const lines = source.split(eol);
  const starts = [];
  const ends = [];
  lines.forEach((line, i) => {
    if (line.trim() === startMarker(name)) starts.push(i);
    else if (line.trim() === endMarker(name)) ends.push(i);
  });
  if (starts.length === 0) throw new Error(`no start marker for shared/${name}`);
  if (starts.length > 1) throw new Error(`${starts.length} start markers for shared/${name}`);
  const start = starts[0];
  if (ends.some((i) => i < start)) throw new Error(`end marker before the start marker for shared/${name}`);
  if (ends.length === 0) throw new Error(`no end marker for shared/${name}`);
  if (ends.length > 1) throw new Error(`${ends.length} end markers for shared/${name}`);

  const indent = lines[start].match(/^[ \t]*/)[0];
  const body = block
    .replace(/\r\n/g, '\n')
    .replace(/\n+$/, '')
    .split('\n')
    .map((line) => (line ? indent + line : line));
  return [...lines.slice(0, start + 1), ...body, ...lines.slice(ends[0])].join(eol);
}

/** @param {string} source */
export function sharedNamesIn(source) {
  return [...new Set([...source.matchAll(MARKER_RE)].map((m) => m[1]))];
}

function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const check = process.argv.includes('--check');
  const manifests = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
  const blocks = new Map();
  const drifted = [];
  let failed = false;

  for (const { main: file } of manifests) {
    const path = join(root, file);
    const source = readFileSync(path, 'utf8');
    let out = source;
    try {
      for (const name of sharedNamesIn(source)) {
        if (!blocks.has(name)) blocks.set(name, readFileSync(join(root, 'shared', name), 'utf8'));
        out = replaceRegion(out, name, blocks.get(name));
      }
    } catch (err) {
      console.error(`${file}: ${err.message}`);
      failed = true;
      continue;
    }
    if (out === source) continue;
    drifted.push(file);
    if (!check) writeFileSync(path, out);
  }

  if (check && drifted.length) {
    console.error(`Shared blocks out of date in:\n${drifted.map((f) => `  ${f}`).join('\n')}\nRun pnpm sync.`);
    failed = true;
  } else if (!check) {
    console.log(drifted.length ? `Synced ${drifted.join(', ')}` : 'Shared blocks already up to date.');
  }
  process.exit(failed ? 1 : 0);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main();
