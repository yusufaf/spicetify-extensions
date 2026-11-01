# Contributing

Contributions are welcome. Each extension is one JavaScript file with no build step, so you edit the file Spotify runs.

## Getting started

1. Fork and clone the repository, then run `pnpm install` at the root. That installs the commit hooks.
2. Copy or symlink `extensions/<name>/<file>.js` into your Spicetify Extensions folder:
   - **Windows:** `%APPDATA%\spicetify\Extensions\`
   - **macOS/Linux:** `~/.config/spicetify/Extensions/`
3. `spicetify config extensions <file>.js` (first time only), then `spicetify apply`.

A symlink means your edits are picked up by reloading Spotify (Ctrl+R with DevTools enabled through `spicetify enable-devtools`), without copying the file again.

## Checks

`pnpm test` at the root syntax-checks every extension and runs the unit tests in each extension's `test/` folder. The pre-commit hook runs it too. Most behavior can only be checked in the running client; each extension's `tests.live.md` lists what to try.

Test against both light and dark Spicetify themes when you change styles.

## Commits and releases

Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/), with the extension's folder name as the scope, for example `fix(rym): ...`. A commit hook checks this.

[release-please](https://github.com/googleapis/release-please) reads those messages to version each extension and write its changelog, so don't edit version numbers or `CHANGELOG.md` by hand.

Never rename or move an extension's `.js` file: Marketplace installs, and the redirects in the old per-extension repositories, load it by its path.

## Pull requests

For anything bigger than a small fix, open an issue first so we can agree on the approach.
