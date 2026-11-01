# CLAUDE.md

Monorepo for yusufaf's Spicetify extensions, their docs site and their tooling. Each extension folder has its own CLAUDE.md with its architecture; this file covers what is shared.

## Layout

- `extensions/<slug>/<file>.js`: one single-file extension per folder, no build step. The path is **permanent**: Marketplace installs and the redirect stubs in the archived per-extension repos load it from `main` by this path. Never rename or move it.
- `manifest.json`: one array of Marketplace entries; `main`, `preview` and `readme` are repo-root-relative. Adding an extension means adding an entry here and in `site/src/data/extensions.mjs` (the site build fails if they disagree).
- `site/`: Astro + Starlight docs site (spicetify.yusufaf.dev). Its own `package.json` and lockfile; run it with `pnpm -C site <script>`. `prebuild` reads each extension's README and CHANGELOG from this repo.
- `tools/compat/`: Spotify/Spicetify update gate and the `window.__spicetifyHealth` contract every extension implements. `pnpm compat <command>`.
- `tools/skills/`: agent skills (`spicetify-live-test`, `spicetify-screenshots`, `spicetify-theme-matrix`) and the per-extension spec templates.

## Commands

```bash
pnpm test            # node --check every extension, their test/*.test.js, and tools/compat tests
pnpm -C site test    # site unit tests
pnpm -C site build   # sync extension pages + build the site
pnpm compat check    # live health check of every extension in the running client
```

## Commits and releases

- Conventional Commits, enforced by commitlint on commit-msg; husky pre-commit runs `pnpm test`.
- Scope is the extension slug (`fix(rym): ...`), or `site`, `compat`, `skills`, `repo`.
- release-please runs in manifest mode: one package per `extensions/<slug>`, tags `<slug>-vX.Y.Z`. It bumps the `x-release-please` marker in the extension file, `version.txt` and `CHANGELOG.md`. Never bump versions by hand.
- A `feat`/`fix` commit touching N extension folders releases all N. Use `chore`/`docs`/`refactor` for changes that shouldn't ship a release.

## Extensions in Spotify

- Spicetify loads every extension as a classic `<script>` sharing one global scope. Keep all code inside the file's IIFE, and keep the `window.__<name>Active` guard at its top so a second copy (Marketplace plus Extensions folder) exits instead of running twice.
- Live testing goes through the `spicetify-live-test` skill (CDP on port 9222).
