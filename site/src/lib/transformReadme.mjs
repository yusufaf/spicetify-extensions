import { GITHUB_OWNER, GITHUB_REPO } from '../data/extensions.mjs'

const SKIP_BLOCK = /<!-- site:skip-start -->[\s\S]*?<!-- site:skip-end -->\n?/g
const FENCE = /^\s*(```|~~~)/
const IMAGE_TARGET = /(!\[[^\]]*\]\()([^)\s]+)/g
const LINK_TARGET = /(\]\()([^)\s]+)/g
const ABSOLUTE = /^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i

/**
 * Turn an extension repo's README into Markdown that can live as a page on the
 * docs site: drop the leading H1 (Starlight renders the frontmatter title),
 * remove `site:skip` blocks, and make relative image and link paths absolute.
 * Fenced code is left untouched.
 *
 * @param {string} markdown - Raw README.md or CHANGELOG.md contents.
 * @param {{ dir: string }} options - `dir` is the extension's folder in the
 *   monorepo (e.g. `extensions/rym`); relative paths resolve against it, so
 *   `../../LICENSE` reaches the repo root.
 * @returns {string} Site-ready Markdown.
 */
export function transformReadme(markdown, { dir }) {
    const raw = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/HEAD/${dir}/`
    const blob = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/blob/HEAD/${dir}/`
    const absolutize = (base) => (match, open, target) =>
        ABSOLUTE.test(target) ? match : `${open}${new URL(target, base).href}`

    let inFence = false
    let seenContent = false

    return markdown
        .replace(/\r\n/g, '\n')
        .replace(SKIP_BLOCK, '')
        .split('\n')
        .flatMap((line) => {
            if (FENCE.test(line)) {
                inFence = !inFence
                seenContent = true
                return [line]
            }
            if (inFence) return [line]

            if (!seenContent && /^# /.test(line)) {
                seenContent = true
                return []
            }
            if (line.trim() !== '') seenContent = true

            // Images first: once a relative image target is absolute, the link pass
            // only sees what's left, so a linked badge's image is never rewritten twice.
            return [line.replace(IMAGE_TARGET, absolutize(raw)).replace(LINK_TARGET, absolutize(blob))]
        })
        .join('\n')
}
