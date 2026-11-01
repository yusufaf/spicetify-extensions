// Source list for scripts/sync-extensions.mjs and the sidebar in astro.config.mjs.
// `slug` is also the URL segment: spicetify.yusufaf.dev/<slug>/. `label` is only
// the sidebar fallback; the page title comes from each repo's manifest.json.
// `guides` lists hand-written pages in src/content/docs/guides/ (by file name,
// without extension) to show in that extension's sidebar group as well; their
// URLs stay under /guides/.
export const EXTENSIONS = [
    { label: 'Album Length', order: 1, repo: 'spicetify-album-length', slug: 'album-length' },
    { label: 'Enhanced Folders', order: 2, repo: 'spicetify-enhanced-folders', slug: 'enhanced-folders' },
    {
        guides: ['pin-more-than-20-playlists-spotify'],
        label: 'Enhanced Pins',
        order: 3,
        repo: 'spicetify-enhanced-pins',
        slug: 'enhanced-pins',
    },
    { label: 'Listening List', order: 4, repo: 'spicetify-listening-list', slug: 'listening-list' },
    {
        guides: ['local-files-bitrate-genre-year-spotify'],
        label: 'Local Files+',
        order: 5,
        repo: 'spicetify-local-files-plus',
        slug: 'local-files-plus',
    },
    { label: 'Producers', order: 6, repo: 'spicetify-producers', slug: 'producers' },
    { label: 'RateYourMusic Integration', order: 7, repo: 'spicetify-rym', slug: 'rym' },
    { label: 'Smart Add', order: 8, repo: 'spicetify-smart-add', slug: 'smart-add' },
]

// The guides folder sits beside the generated extension folders, which the sync
// deletes and rebuilds, so no extension may use this slug.
export const GUIDES_DIR = 'guides'

export const GITHUB_OWNER = 'yusufaf'
export const SITE = 'https://spicetify.yusufaf.dev'
