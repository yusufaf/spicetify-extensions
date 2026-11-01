import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { transformReadme } from '../src/lib/transformReadme.mjs'

const RAW = 'https://raw.githubusercontent.com/yusufaf/spicetify-rym/HEAD'
const BLOB = 'https://github.com/yusufaf/spicetify-rym/blob/HEAD'
const run = (markdown) => transformReadme(markdown, { repo: 'spicetify-rym' })
const fixture = (name) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8')

describe('leading H1', () => {
    it('is dropped because Starlight renders the frontmatter title', () => {
        expect(run('# My Extension\n\nBody text.\n')).toBe('\nBody text.\n')
    })

    it('only removes the first H1, never "# comments" inside fenced code', () => {
        const out = run('# Title\n\n```sh\n# Grab the file\ncurl x\n```\n')
        expect(out).toContain('# Grab the file')
        expect(out).not.toMatch(/^# Title/m)
    })
})

describe('site:skip blocks', () => {
    it('removes everything between the markers, markers included', () => {
        const out = run(
            '# T\n\n<!-- site:skip-start -->\n**Documentation:** https://example.com\n<!-- site:skip-end -->\n\nKept.\n',
        )
        expect(out).not.toContain('Documentation')
        expect(out).not.toContain('site:skip')
        expect(out).toContain('Kept.')
    })

    it('handles several blocks in one README', () => {
        const out = run(
            'A\n<!-- site:skip-start -->x<!-- site:skip-end -->\nB\n<!-- site:skip-start -->y<!-- site:skip-end -->\nC\n',
        )
        expect(out).not.toMatch(/[xy]/)
        expect(out).toMatch(/A[\s\S]*B[\s\S]*C/)
    })
})

describe('relative paths', () => {
    it('rewrites relative images to raw.githubusercontent.com', () => {
        expect(run('![Preview](preview.png)')).toBe(`![Preview](${RAW}/preview.png)`)
    })

    it('rewrites images inside table cells', () => {
        const out = run('| ![Settings](settings.png) | ![Tooltip](tooltip.png) |')
        expect(out).toBe(`| ![Settings](${RAW}/settings.png) | ![Tooltip](${RAW}/tooltip.png) |`)
    })

    it('rewrites relative links to github.com blob URLs', () => {
        expect(run('See [LICENSE](LICENSE).')).toBe(`See [LICENSE](${BLOB}/LICENSE).`)
    })

    it('normalizes a leading ./', () => {
        expect(run('[Contributing](./CONTRIBUTING.md)')).toBe(`[Contributing](${BLOB}/CONTRIBUTING.md)`)
    })

    it('leaves absolute URLs and #anchors alone', () => {
        const input = '[a](https://example.com/x) [b](#install) ![c](https://example.com/c.png)'
        expect(run(input)).toBe(input)
    })

    it('rewrites only the outer link of a linked badge', () => {
        const badge = '[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)'
        expect(run(badge)).toBe(
            `[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](${BLOB}/LICENSE)`,
        )
    })

    it('leaves an already-absolute linked badge untouched', () => {
        const badge =
            '[![Release](https://img.shields.io/github/v/release/yusufaf/x)](https://github.com/yusufaf/x/releases)'
        expect(run(badge)).toBe(badge)
    })
})

describe('real READMEs', () => {
    it('leaves no relative image or link in the rym README', () => {
        const out = run(fixture('rym.README.md'))
        expect(out).not.toMatch(/!\[[^\]]*\]\((?!https?:)/)
        expect(out).not.toMatch(/\]\((?!https?:|#)/)
        expect(out).not.toMatch(/^# RateYourMusic Spicetify Extension/m)
    })

    it('leaves no relative path in the enhanced-folders README, even with linked badges', () => {
        const out = run(fixture('enhanced-folders.README.md'))
        expect(out).not.toMatch(/\]\((?!https?:|#)/)
        expect(out).toContain('# Grab enhanced-folders.js from the latest release')
    })
})
