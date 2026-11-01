// The sync deletes and rewrites src/content/docs/<slug>/ for every extension, so a
// slug must be a plain folder name that can't reach anything else: not a path
// (`./guides`, `.`), not the guides folder, and not a URL the site already uses
// (a top-level page, Starlight's 404, the Pagefind search index).
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/
const BUILT_IN = ['404', 'pagefind']

/**
 * @param {{ extensions: { repo: string, slug: string }[], guidesDir: string, topLevelPages: string[] }} params
 *   `topLevelPages` are the file names in src/content/docs (e.g. `getting-started.md`).
 * @returns {string[]} One message per bad slug; empty when all are fine.
 */
export function checkSlugs({ extensions, guidesDir, topLevelPages }) {
    const reserved = new Set([
        guidesDir,
        ...BUILT_IN,
        ...topLevelPages.map((name) => name.replace(/\.[^.]+$/, '').toLowerCase()),
    ])
    const problems = []
    for (const { repo, slug } of extensions) {
        if (!SLUG.test(slug)) problems.push(`${repo}: slug '${slug}' must be lowercase letters, digits and dashes`)
        else if (reserved.has(slug)) problems.push(`${repo}: slug '${slug}' is reserved`)
    }
    return problems
}
