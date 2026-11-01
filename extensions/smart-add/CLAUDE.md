# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-file Spicetify (Spotify desktop client) extension: `smart-add.js`. No build step, no bundler, no runtime dependencies. The whole extension is one IIFE running in Spotify's `xpui` renderer. It adds a "Suggested" section to the native Add to playlist modal, driven by artist/show → playlist mappings.

The v1 design, decisions, and spike findings are in `docs/superpowers/specs/2026-10-11-smart-add-design.md`. Read it before changing the injector.

## Commands

```bash
pnpm test        # from the repo root: syntax-checks every extension and runs smart-add's test/*.test.js
```

- Pure logic (parsing, grouping, pruning, freshness, URI extraction) is exported through the `module.exports` guard at the end of `smart-add.js` and unit-tested in `test/`. In Spotify the guard calls `saMain()` instead. Add new pure functions to that export list and test them there.
- Commits and releases: see the repo-root CLAUDE.md (scope `smart-add`).

## Live testing

Behavior only exists inside Spotify. Use the `spicetify-live-test` skill (CDP). `tests.live.md` has the smoke test and scenarios. Debug output is prefixed `[Smart Add]`.

The repo is not symlinked into Spicetify (hardlinks/symlinks are unsafe here). Copy `smart-add.js` into both `%APPDATA%\spicetify\Extensions\` and `%APPDATA%\Spotify\Apps\xpui\extensions\` after each edit, then reload via CDP. Re-copy after any `spicetify apply`.

## Architecture

Organized into `//#region` blocks, in this order: Constants, State, Storage, Platform Helpers, Mappings Store, Trigger Capture, Modal Injector, Mapping Editor, Context Menus, Settings, Styles, Bootstrap. Keep new code in the matching region.

Key invariants:

- **Never break the native modal.** Every injector/render path is wrapped in try/catch and logs with `[Smart Add]`. If injection fails, the native Add to playlist modal must still work.
- **Anchor on structure, not text or hashed classes.** The modal is a `form` containing `input[role=searchbox]` and `ul[role=menu]`. The older right-click submenu in `#context-menu` also has a searchbox but is not a `form` and is out of scope for v1.
- **Persistence is `Spicetify.LocalStorage` only**, keys `smart-add-data` and `smart-add-config`. Mappings are keyed by artist/show URI; names are display caches.
- **Re-entrant.** The modal form is recreated on every open and React re-renders it often. Dedupe on the form node and re-inject if our node is removed.
- **Wrong suggestions are worse than none.** Inject only when the trigger capture is fresh (2 s, used once) and sources, playlists and native rows are ready within 300 ms.
- **The "+" is the save button.** Capture keys on `button[aria-checked]` in a `[role=row]`, the now-playing bar or `#Desktop_PanelContainer_Id`. Track/episode URIs come from React props (`saRowUri`), since rows carry none in the DOM.
- **Native modal rows** are `button[role=menuitemcheckbox]`; their playlist URI is on a child's `aria-labelledby="listrow-title-<uri>"` (`saNativeRowUri`). Our rows mirror the twin's `aria-checked`.
- **Never prune from a cached rootlist.** The render path only hides unknown playlists; `saPruneStored` deletes after a fresh `RootlistAPI` read.

## Versioning

Release-please owns the version at the repo root; it updates the `// VERSION:` banner in `smart-add.js` (inside `x-release-please` markers) and `CHANGELOG.md`. Don't bump by hand; land Conventional Commits. The Marketplace entry is in the repo-root `manifest.json`.

## Style

- JSDoc comments on functions.
- `SA_` constant prefix, `sa-` CSS class / DOM id prefix.
- CSS must not hardcode colors; use Spicetify theme variables.
- Update `CHANGELOG.md` only via release-please.
