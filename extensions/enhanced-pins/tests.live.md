# Live Tests — Enhanced Pins

Extension file: `enhanced-pins.js`  
Use skill `spicetify-live-test` for CDP mechanics (reload, eval, screenshot, console).

## Storage keys (`Spicetify.LocalStorage.get(key)` or `localStorage.getItem(key)`)

| Key | Contents |
|-----|----------|
| `enhanced-pins-data` | JSON array of pin objects |
| `enhanced-pins-config` | JSON config object |

## Smoke test (run after every edit)

1. `node --check enhanced-pins.js` — syntax gate.
2. CDP reload xpui.
3. Console (filter `Enhanced Pins`): expect `[Enhanced Pins] Starting...` then `[Enhanced Pins] Initialized`.
4. Screenshot: verify "ENHANCED PINS" section visible at top of left sidebar.

```js
// Eval to verify storage readable
Spicetify.LocalStorage.get('enhanced-pins-data')      // → JSON string or null
Spicetify.LocalStorage.get('enhanced-pins-config')    // → JSON string or null
```

## T1: Pins render from storage

- Eval: `JSON.parse(Spicetify.LocalStorage.get('enhanced-pins-data') || '[]').length`
- Assert: returns a number ≥ 0 (no parse error = storage schema valid).
- Screenshot: sidebar pins section; count of visible pin rows should match the array length.

## T2: Config defaults apply when key absent

- Setup: `Spicetify.LocalStorage.remove('enhanced-pins-config')` then reload.
- Assert: no JS error in console; `[Enhanced Pins] Initialized` still appears.
- Eval: `Spicetify.LocalStorage.get('enhanced-pins-config')` → should be non-null (extension re-wrote defaults).

## T3: Pin context menu present

- Navigate to any playlist in Spotify.
- Right-click the playlist in the sidebar.
- Screenshot: context menu should contain a "Pin" or "Unpin" option.

## T4: Config modal opens

- Eval: find the settings/gear button for Enhanced Pins and click it.
- Assert: a modal dialog appears (screenshot).
- Close modal; assert no errors in console.

## T6: Pseudo-playlist pins (Local Files, Liked Songs, Your Episodes)

Spotify's auto-generated library entries use URI type `collection` with no base62 id
(`spotify:collection:local-files`, `spotify:collection:tracks`, `spotify:collection:your-episodes`)
— they need their own metadata/path handling, see `PSEUDO_COLLECTIONS`.

- Pin one via the native right-click context menu (e.g. right-click "Local Files" in the library
  list > Enhanced Pin).
- Eval: `JSON.parse(Spicetify.LocalStorage.get('enhanced-pins-data')).find(p => p.uri === 'spotify:collection:local-files').name`
  — assert it is `"Local Files"`, not `"Unknown"`.
- Screenshot: pin renders with a distinguishing glyph placeholder (folder/heart/bookmark), not a
  blank tile.
- With the "Playlists" library filter chip active, assert the pin is still visible (not filtered
  out — `collection` is in `FILTER_TYPE_MAP.playlists`).
- Click the pin: eval `Spicetify.Platform.History.location.pathname` → `/collection/local-files`
  (or `/collection/tracks` for Liked Songs).
- Right-click the pin: assert Radio/Download/Pin playlist are hidden; assert Copy Link is hidden
  only for Local Files (Liked Songs/Your Episodes keep it, since their URL is meaningful).
- Regression: repeat the context-menu check on a normal playlist pin — Radio/Download/Pin
  playlist/Copy Link should all still show.

## T5: Hot-reload sanity

- Add `console.log('[Enhanced Pins] HOT-RELOAD-MARKER')` to line 3087.
- Save (symlink means Spotify picks it up immediately).
- CDP reload.
- Console filter `HOT-RELOAD-MARKER`: must appear.
- Revert the line.
