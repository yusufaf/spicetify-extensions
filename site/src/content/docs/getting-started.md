---
title: Install Spicetify and extensions
description: Install Spicetify, then add an extension through Marketplace or by copying the file by hand.
---

These extensions run inside the Spotify desktop client through [Spicetify](https://spicetify.app/docs/getting-started). Install Spicetify first.

## Install an extension from Marketplace

1. Install the [Spicetify Marketplace](https://spicetify.app/docs/customization/marketplace) custom app if you haven't already.
2. In Spotify, open **Marketplace** (the shopping-cart icon at the top left) and stay on the **Extensions** tab.
3. Search for the extension's name. If it doesn't show up, click **Load more** (» at the bottom of the list) until it does. Marketplace loads extensions in batches and only searches the ones it has loaded.
4. Hover the card, click its download button, then click **Reload now**.

Once every batch has loaded, searching `yusufaf` lists all of these extensions at once.

Marketplace finds extensions by their GitHub repository topic (`spicetify-extensions`) and shows each extension's README as its page.

## Install an extension by hand

1. Download the extension's `.js` file from its repository.
2. Copy it into your Spicetify `Extensions` folder:
   - Windows: `%APPDATA%\spicetify\Extensions`
   - macOS and Linux: `~/.config/spicetify/Extensions`
3. Enable it and apply:

   ```sh
   spicetify config extensions <file-name>.js
   spicetify apply
   ```

## After Spotify updates

A Spotify update can wipe the changes Spicetify made. Re-apply them with:

```sh
spicetify backup apply
```

If an extension stops working after an update, check its page here and its repository's issues. See [Troubleshooting](/troubleshooting/) for more.
