# Spicetify extensions

Extensions for the Spotify desktop client, built for [Spicetify](https://spicetify.app). Install any of them from the Spicetify Marketplace, or read the docs at **[spicetify.yusufaf.dev](https://spicetify.yusufaf.dev/)**.

| Extension | What it does |
|---|---|
| [Album Length](extensions/album-length) | Show the length of each track's source album/EP inline in playlists, Liked Songs, and the Queue. |
| [Enhanced Folders](extensions/enhanced-folders) | Add custom images and descriptions to Spotify playlist folders. |
| [Enhanced Pins](extensions/enhanced-pins) | Unlimited pins in their own sidebar section, with sorting, icons, and backup |
| [Listening List](extensions/listening-list) | Mark albums and tracks as listened, with inline indicators across Spotify. |
| [Local Files+](extensions/local-files-plus) | Real tag metadata as sortable, filterable columns on the Local Files page: artist, album artist, year, genre, bitrate/quality, file type, size, folder, and more. |
| [Producers](extensions/producers) | Show each track's producers, from Spotify's own credits, as a column on album and playlist pages. |
| [RateYourMusic Integration](extensions/rym) | Quick access to RateYourMusic album and artist pages directly from Spotify's Now Playing sidebar |
| [Smart Add](extensions/smart-add) | Suggests your mapped playlists first in Spotify's Add to playlist menu |

Each extension is a single JavaScript file with no build step, in its own folder under `extensions/`.

## Repository layout

- `extensions/<name>/`: the extension file, its README, changelog and screenshots
- `manifest.json`: the Marketplace descriptor for all of them
- `site/`: the docs site at spicetify.yusufaf.dev
- `tools/compat/`: checks the extensions against new Spotify and Spicetify releases
- `tools/skills/`: skills for AI coding agents working on Spicetify extensions

Found a bug or have an idea? [Open an issue](https://github.com/yusufaf/spicetify-extensions/issues/new/choose) and pick the extension. See [CONTRIBUTING.md](CONTRIBUTING.md) to work on the code.

## License

MIT. See [LICENSE](LICENSE).
