---
title: For developers
description: Conventions shared by the extension repositories, and tooling for working on Spicetify extensions with AI coding agents.
---

## Shared conventions

Every extension is a single JavaScript file with no build step, in its own repository. They share:

- [Conventional Commits](https://www.conventionalcommits.org/), enforced by commitlint through a husky hook
- [release-please](https://github.com/googleapis/release-please) for versions and changelogs, so versions are never bumped by hand
- pnpm as the package manager
- a `manifest.json` that Spicetify Marketplace reads

## Agent skills

[spicetify-agent-skills](https://github.com/yusufaf/spicetify-agent-skills) holds skills for AI coding agents that work on Spicetify extensions, including driving a running Spotify client over the Chrome DevTools Protocol.

## This site

The extension pages are generated at build time from each repository's README and changelog, so the README is the source of truth. To change an extension's page, edit its README in the extension repository.
