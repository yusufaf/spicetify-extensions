---
title: For developers
description: Conventions shared by the extensions, and tooling for working on Spicetify extensions with AI coding agents.
---

## Shared conventions

All the extensions live in one repository, [spicetify-extensions](https://github.com/yusufaf/spicetify-extensions), each in its own folder under `extensions/`. Every extension is a single JavaScript file with no build step. They share:

- [Conventional Commits](https://www.conventionalcommits.org/), enforced by commitlint through a husky hook
- [release-please](https://github.com/googleapis/release-please) for versions and changelogs, with a separate version and changelog per extension, so versions are never bumped by hand
- pnpm as the package manager
- one array `manifest.json` at the repository root, which Spicetify Marketplace reads

## Tooling

[`tools/skills`](https://github.com/yusufaf/spicetify-extensions/tree/HEAD/tools/skills) holds skills for AI coding agents that work on Spicetify extensions, including driving a running Spotify client over the Chrome DevTools Protocol. [`tools/compat`](https://github.com/yusufaf/spicetify-extensions/tree/HEAD/tools/compat) watches for Spotify and Spicetify releases and checks every extension against the running client after an update.

## This site

The extension pages are generated at build time from each extension's README and changelog, so the README is the source of truth. To change an extension's page, edit `extensions/<name>/README.md`.
