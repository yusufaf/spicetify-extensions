---
title: Troubleshooting
description: Common fixes that apply to every extension, and how to read an extension's console output.
---

These steps apply to every extension. Each extension's own page covers problems specific to it.

## The extension doesn't appear

Re-apply Spicetify, which also restores its changes after a Spotify update:

```sh
spicetify backup apply
```

If it still doesn't load, confirm the file is listed in your config:

```sh
spicetify config extensions
```

Extensions installed from Marketplace aren't listed there, because Marketplace loads them itself. Check that they appear on Marketplace's **Installed** tab instead.

## Read the console output

Each extension prefixes its console messages with its name, for example `[Album Length]`.

1. Enable DevTools once with `spicetify enable-devtools`, then `spicetify apply`.
2. In Spotify press `Ctrl+Shift+I` (or right-click and choose **Inspect Element**).
3. Open the **Console** tab and filter by the extension's prefix.

Include those lines when you open an issue on the extension's repository.

## Spotify changed and an extension broke

Extensions rely on Spotify's internal APIs, which change between releases. Check the extension's changelog and open issues for a fix, and report the Spotify and Spicetify versions you're on.
