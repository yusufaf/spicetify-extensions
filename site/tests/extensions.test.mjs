import { describe, expect, it } from 'vitest'
import { EXTENSIONS, GUIDES_DIR } from '../src/data/extensions.mjs'
import { checkSlugs } from '../src/lib/checkSlugs.mjs'
import { markAllCurrent } from '../src/lib/markAllCurrent.mjs'

const TOP_LEVEL = ['developers.md', 'getting-started.md', 'index.mdx', 'troubleshooting.md']
const check = (...slugs) =>
    checkSlugs({
        extensions: slugs.map((slug) => ({ repo: `repo-${slug}`, slug })),
        guidesDir: GUIDES_DIR,
        topLevelPages: TOP_LEVEL,
    })

describe('checkSlugs', () => {
    it('accepts every real extension slug', () => {
        expect(checkSlugs({ extensions: EXTENSIONS, guidesDir: GUIDES_DIR, topLevelPages: TOP_LEVEL })).toEqual([])
    })

    it('rejects slugs the sync could use to delete or shadow something else', () => {
        for (const slug of ['guides', 'troubleshooting', 'index', '404', 'pagefind']) {
            expect(check(slug), slug).toEqual([`repo-${slug}: slug '${slug}' is reserved`])
        }
    })

    it('rejects anything but a plain lowercase name, so a path can never reach another folder', () => {
        for (const slug of ['Guides', './guides', 'guides/', '.', '', '../x', 'a_b', '-x']) {
            expect(check(slug)[0], JSON.stringify(slug)).toMatch(/must be lowercase letters, digits and dashes/)
        }
    })
})

describe('markAllCurrent', () => {
    const guide = '/guides/pin-more-than-20-playlists-spotify/'
    const link = (href) => ({ href, isCurrent: false, type: 'link' })
    const sidebar = () => [group([link(guide)]), group([link('/enhanced-pins/'), link(guide)]), group([link('/rym/')])]
    const group = (entries) => ({ collapsed: true, entries, type: 'group' })
    const current = (entries) => entries.flatMap((entry) => (entry.type === 'group' ? current(entry.entries) : entry.isCurrent ? [entry.href] : []))

    it('marks every copy of the current page, in any group', () => {
        const entries = sidebar()
        markAllCurrent(entries, guide)
        expect(current(entries)).toEqual([guide, guide])
    })

    it('matches without the trailing slash and with percent-encoding, as Starlight does', () => {
        const entries = sidebar()
        markAllCurrent(entries, '/guides/pin-more-than-20-playlists-spotify')
        expect(current(entries)).toEqual([guide, guide])

        const accented = [group([link('/guides/café/')])]
        markAllCurrent(accented, '/guides/caf%C3%A9/')
        expect(current(accented)).toEqual(['/guides/café/'])
    })

    it('leaves the sidebar alone when the page is not in it', () => {
        const entries = sidebar()
        markAllCurrent(entries, '/404/')
        expect(current(entries)).toEqual([])
    })
})
