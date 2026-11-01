# compat

Tells you when it's safe to update Spotify and Spicetify, and checks that every extension still works afterwards.

Spotify's desktop client ships about once a week and regularly breaks Spicetify extensions. Static analysis of a new Spotify build can't tell you whether an extension still works: most extensions now find the UI through ARIA roles and data attributes, and only the logged-in client renders those. So this tool splits the job:

- **`watch` (GitHub Actions, `.github/workflows/compat-watch.yml` at the repo root)** notices new Spotify (Windows GA) and Spicetify releases and opens one issue per combination, labelled `compat-watch`, saying whether Spicetify claims support yet.
- **`compat scan` (your PC)** downloads the new installer, keeps it for rollback, and compares the build with your last-known-good one. It covers GraphQL operations, `data-testid`s and the css-map classes your extensions use.
- **`compat check` (your PC)** checks that the extension files Spotify loads are intact, cold-starts Spotify, and reads each extension's health hook.

It checks every extension listed in the root `manifest.json` of this repo.

## Setup

Requires Node 22+, Windows, Spicetify, and Spotify launched with a debug port (`spotify_launch_flags = --remote-debugging-port=9222` in `config-xpui.ini`).

Run these from `tools/compat` (or use `pnpm compat <command>` from the repo root):

```sh
cp compat.local.example.json compat.local.json   # then edit routes and expectations
pnpm compat baseline                             # index the installed build as last-known-good
```

`compat.local.json` is gitignored. It names the pages `check` opens (`routes`) and which extensions should find something on each page (`expect`).

## Updating Spotify

Spotify's own updater should stay blocked, so you update when you choose to. Blocking means a read-only `%LOCALAPPDATA%\Spotify\Update` with a Deny ACL for your user.

1. An issue from `watch` says a new Spotify build or Spicetify release is out.
2. Once it says Spicetify claims support, run `pnpm compat scan`. Anything marked `BROKEN` will need a fix after updating.
3. Update:
   1. `spicetify upgrade`
   2. Run the installer that `scan` saved under `%LOCALAPPDATA%\spicetify-compat\installers`. You may need to lift the Deny ACL on the `Update` folder first; put it back afterwards.
   3. `spicetify backup apply`
4. Run `pnpm compat check`. When nothing fails, run `pnpm compat check --record` and commit `state/verified.json`.
5. If an extension fails, fix it under `extensions/` (the `spicetify-live-test` skill helps) and run `check` again. To roll back, reinstall the previous saved installer and the previous Spicetify version.

## Health hook contract

Each extension registers a function once its own start-up has finished:

```js
(window.__spicetifyHealth ??= {})['album-length'] = () => ({
  ready: true,                      // the extension's readiness gate passed
  anchors: { badges: countBadges() }, // things it found or injected on the current page
  errors: [],                       // problems it detected itself
});
```

The key is the `main` file name without `.js`. `check` reads the hook right after a cold start, where a missing hook means a start-up failure. It then opens each route in `compat.local.json` and expects at least one anchor on every route listed for that extension.

## State

- `state/builds/<build>.json` holds names and hashes extracted from a Spotify build: GraphQL operations, `data-testid`s and CSS class names. No Spotify code is stored.
- `state/verified.json` is the last-known-good build, written by `compat baseline` or `compat check --record`.
- `watch.json` on the `compat-state` branch is the watcher's last observation, committed there by the workflow so main's history stays clean.
