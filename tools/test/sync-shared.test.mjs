import { test } from 'node:test';
import assert from 'node:assert/strict';
import { replaceRegion, startMarker, endMarker } from '../sync-shared.mjs';

const wrap = (indent, body) =>
  [`(function () {`, `${indent}${startMarker('footer.js')}`, ...body, `${indent}${endMarker('footer.js')}`, `})();`, ''].join('\n');

test('replaces the region body and indents it to the start marker', () => {
  const source = wrap('  ', ['  const old = 1;']);
  const out = replaceRegion(source, 'footer.js', 'const a = 1;\n\nfunction b() {\n  return a;\n}\n');
  assert.equal(out, wrap('  ', ['  const a = 1;', '', '  function b() {', '    return a;', '  }']));
});

test('works at column 0', () => {
  const out = replaceRegion(wrap('', []), 'footer.js', 'const a = 1;');
  assert.equal(out, wrap('', ['const a = 1;']));
});

test('is idempotent', () => {
  const once = replaceRegion(wrap('    ', ['stale']), 'footer.js', 'const a = 1;\n');
  assert.equal(replaceRegion(once, 'footer.js', 'const a = 1;\n'), once);
});

test('keeps CRLF line endings', () => {
  const source = wrap('  ', ['x']).replaceAll('\n', '\r\n');
  const out = replaceRegion(source, 'footer.js', 'const a = 1;\nconst b = 2;\n');
  assert.equal(out, wrap('  ', ['  const a = 1;', '  const b = 2;']).replaceAll('\n', '\r\n'));
});

test('leaves the rest of the file alone', () => {
  const source = `before\n${wrap('', ['x'])}after\n`;
  const out = replaceRegion(source, 'footer.js', 'y');
  assert.ok(out.startsWith('before\n(function () {\n'));
  assert.ok(out.endsWith('})();\nafter\n'));
});

test('rejects a missing start marker', () => {
  assert.throws(() => replaceRegion('const a = 1;\n', 'footer.js', 'x'), /no start marker/);
});

test('rejects a missing end marker', () => {
  assert.throws(() => replaceRegion(`${startMarker('footer.js')}\nx\n`, 'footer.js', 'x'), /no end marker/);
});

test('rejects a duplicate start marker', () => {
  const source = wrap('', ['x']) + wrap('', ['y']);
  assert.throws(() => replaceRegion(source, 'footer.js', 'x'), /2 start markers/);
});

test('rejects an end marker before the start marker', () => {
  const source = `${endMarker('footer.js')}\n${startMarker('footer.js')}\n`;
  assert.throws(() => replaceRegion(source, 'footer.js', 'x'), /end marker before/);
});

test('ignores regions for other shared files', () => {
  const other = `${startMarker('other.js')}\nkeep\n${endMarker('other.js')}\n`;
  const out = replaceRegion(other + wrap('', ['x']), 'footer.js', 'y');
  assert.ok(out.startsWith(other));
});
