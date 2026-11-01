#!/usr/bin/env node
// Pulls each extension repo's manifest, README and changelog from GitHub and
// writes them as pages under src/content/docs/<slug>/, plus a JSON summary the
// landing-page shelf reads. Runs as `prebuild`; every output is gitignored.
//
// Reads from the repo's default branch (`HEAD`), the same ref Spicetify
// Marketplace reads, so the site and the Marketplace listing never disagree.
// A missing manifest or README fails the build on purpose: shipping a site with
// a silently empty extension page is worse than a red deploy.

import { mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { EXTENSIONS, GITHUB_OWNER, GUIDES_DIR } from '../src/data/extensions.mjs'
import { checkSlugs } from '../src/lib/checkSlugs.mjs'
import { imageSize, ogImageHead } from '../src/lib/ogImage.mjs'
import { transformReadme } from '../src/lib/transformReadme.mjs'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const DOCS_DIR = path.join(ROOT, 'src', 'content', 'docs')
const SUMMARY_FILE = path.join(ROOT, 'src', 'data', 'extensions.generated.json')

const rawUrl = (repo, file) => `https://raw.githubusercontent.com/${GITHUB_OWNER}/${repo}/HEAD/${file}`

async function fetchText(url, { optional = false } = {}) {
    const res = await fetch(url)
    if (res.status === 404 && optional) return null
    if (!res.ok) throw new Error(`${url} -> ${res.status} ${res.statusText}`)
    return res.text()
}

// JSON strings are valid YAML scalars, so this sidesteps quoting bugs in titles
// and descriptions that contain colons or quotes.
const frontmatter = (fields) =>
    `---\n${Object.entries(fields)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join('\n')}\n---\n\n`

function absolutize(repo, file) {
    if (!file) return null
    return /^https?:\/\//.test(file) ? file : rawUrl(repo, file.replace(/^\.?\//, ''))
}

// Dimensions decide whether a preview is big enough to be the page's og:image. A
// preview that can't be fetched only costs the page its social image, not the build.
async function fetchImageSize(url) {
    if (!url) return null
    try {
        const res = await fetch(url)
        return res.ok ? imageSize(new Uint8Array(await res.arrayBuffer())) : null
    } catch {
        return null
    }
}

async function syncExtension({ repo, slug, order }) {
    const [manifestText, readme, changelog, releaseManifestText] = await Promise.all([
        fetchText(rawUrl(repo, 'manifest.json')),
        fetchText(rawUrl(repo, 'README.md')),
        fetchText(rawUrl(repo, 'CHANGELOG.md'), { optional: true }),
        fetchText(rawUrl(repo, '.release-please-manifest.json'), { optional: true }),
    ])

    // Marketplace allows an array manifest; these repos each hold exactly one entry.
    const parsed = JSON.parse(manifestText)
    const manifest = Array.isArray(parsed) ? parsed[0] : parsed
    const version = releaseManifestText ? (JSON.parse(releaseManifestText)['.'] ?? null) : null
    const editUrl = `https://github.com/${GITHUB_OWNER}/${repo}/edit/HEAD/README.md`
    const preview = absolutize(repo, manifest.preview)
    const head = ogImageHead(preview, await fetchImageSize(preview))

    const outDir = path.join(DOCS_DIR, slug)
    await rm(outDir, { force: true, recursive: true })
    await mkdir(outDir, { recursive: true })

    await writeFile(
        path.join(outDir, 'index.md'),
        frontmatter({
            description: manifest.description,
            editUrl,
            head,
            sidebar: { label: 'Overview', order: 0 },
            title: manifest.name,
        }) + transformReadme(readme, { repo }),
    )

    if (changelog) {
        await writeFile(
            path.join(outDir, 'changelog.md'),
            frontmatter({
                description: `Release history for ${manifest.name}.`,
                editUrl: false,
                head,
                sidebar: { label: 'Changelog', order: 1 },
                title: `${manifest.name} changelog`,
            }) + transformReadme(changelog, { repo }),
        )
    }

    return {
        description: manifest.description,
        name: manifest.name,
        order,
        preview,
        repo,
        repoUrl: `https://github.com/${GITHUB_OWNER}/${repo}`,
        slug,
        version,
    }
}

// syncExtension deletes and rewrites src/content/docs/<slug>/; see checkSlugs.
const slugProblems = checkSlugs({
    extensions: EXTENSIONS,
    guidesDir: GUIDES_DIR,
    topLevelPages: (await readdir(DOCS_DIR, { withFileTypes: true }))
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name),
})
if (slugProblems.length > 0) throw new Error(`Bad extension slugs:\n${slugProblems.join('\n')}`)

const results = await Promise.allSettled(EXTENSIONS.map(syncExtension))
const failures = results
    .map((result, index) => ({ extension: EXTENSIONS[index], result }))
    .filter(({ result }) => result.status === 'rejected')

if (failures.length > 0) {
    for (const { extension, result } of failures) {
        console.error(`[sync-extensions] ${extension.repo}: ${result.reason.message}`)
    }
    process.exit(1)
}

const summary = results.map((result) => result.value).sort((a, b) => a.order - b.order)
await writeFile(SUMMARY_FILE, `${JSON.stringify(summary, null, 2)}\n`)
console.log(`[sync-extensions] synced ${summary.length} extensions`)
