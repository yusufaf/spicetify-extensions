# Live Tests — Enhanced Folders

Extension file: `enhanced-folders.js`  
Use skill `spicetify-live-test` for CDP mechanics (reload, eval, screenshot, console).

## Storage keys (`Spicetify.LocalStorage.get(key)` or `localStorage.getItem(key)`)

| Key | Contents |
|-----|----------|
| `enhanced-folders:data` | JSON — folder metadata, schema-versioned (`{ schemaVersion, folders: {} }`) |

## Smoke test (run after every edit)

1. `node --check enhanced-folders.js` — syntax gate.
2. CDP reload xpui.
3. Console (filter `Enhanced Folders`): expect `[Enhanced Folders] Booted. Schema v<N>, <M> stored folder(s).`
   - No `failed to load storage` or `unknown schema` errors.
4. Screenshot: verify folders visible in Spotify sidebar library.

```js
// Eval to verify storage readable
JSON.parse(Spicetify.LocalStorage.get('enhanced-folders:data') || 'null')
// → { schemaVersion: N, folders: { ... } } or null (first run)
```

## T1: Storage schema valid

- Eval: `(() => { const d = JSON.parse(Spicetify.LocalStorage.get('enhanced-folders:data') || '{}'); return { schema: d.schemaVersion, count: Object.keys(d.folders || {}).length }; })()`
- Assert: `schema` is a number, `count` matches the boot log message.

## T2: Double-load guard

- Eval the guard check directly:
  ```js
  // Look for the already-loaded log in console
  ```
- Or reload xpui twice and assert only one `Booted.` line in console (no duplicate).

## T3: Unknown schema version reset

- Inject a bad schema version into storage:
  ```js
  (() => {
    const d = JSON.parse(Spicetify.LocalStorage.get('enhanced-folders:data') || '{"schemaVersion":1,"folders":{}}');
    d.schemaVersion = 999;
    Spicetify.LocalStorage.set('enhanced-folders:data', JSON.stringify(d));
  })()
  ```
- CDP reload.
- Console: expect `[Enhanced Folders] unknown schema 999; resetting` warning.
- Assert: extension still boots successfully (`Booted.` in console).

## T4: Stale-entry cleanup logged

- Console after boot: if any stale entries exist, expect `[Enhanced Folders] cleaned up N stale entr(y/ies).`
- (This fires async after boot; capture console for 3–5 s post-reload.)

## T5: Folder rename via UI

- Screenshot before: note a folder name in the sidebar.
- Right-click a folder → trigger rename option if present.
- Type a new name.
- Screenshot after: new name visible.
- Eval: `JSON.parse(Spicetify.LocalStorage.get('enhanced-folders:data')).folders` → new name persisted.

## T6: Hot-reload sanity

- Add `console.log('[Enhanced Folders] HOT-RELOAD-MARKER')` near the Booted log.
- CDP reload; console filter `HOT-RELOAD-MARKER`: must appear.
- Revert.
