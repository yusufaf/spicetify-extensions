#!/usr/bin/env node
// Reads each extension's manifest entry, README and changelog from this monorepo and
// writes them as pages under src/content/docs/<slug>/, plus a JSON summary the
// landing-page shelf reads. Runs as `prebuild`; every output is gitignored.
//
// The site builds from the same commit Marketplace serves, so the two never disagree.
// A missing manifest entry or README fails the build on purpose: shipping a site with
// a silently empty extension page is worse than a red deploy.

import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { EXTENSIONS, GITHUB_OWNER, GITHUB_REPO, GUIDES_DIR } from '../src/data/extensions.mjs'
import { checkSlugs } from '../src/lib/checkSlugs.mjs'
import { imageSize, ogImageHead } from '../src/lib/ogImage.mjs'
import { transformReadme } from '../src/lib/transformReadme.mjs'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const REPO_ROOT = path.join(ROOT, '..')
const DOCS_DIR = path.join(ROOT, 'src', 'content', 'docs')
const SUMMARY_FILE = path.join(ROOT, 'src', 'data', 'extensions.generated.json')

const rawUrl = (file) => `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/HEAD/${file}`
const readRepoFile = (file) => readFile(path.join(REPO_ROOT, file), 'utf8')
const readOptional = async (file) => (existsSync(path.join(REPO_ROOT, file)) ? readRepoFile(file) : null)

// JSON strings are valid YAML scalars, so this sidesteps quoting bugs in titles
// and descriptions that contain colons or quotes.
const frontmatter = (fields) =>
    `---\n${Object.entries(fields)
        .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
        .join('\n')}\n---\n\n`

// Dimensions decide whether a preview is big enough to be the page's og:image. A
// preview that can't be read only costs the page its social image, not the build.
async function previewSize(file) {
    if (!file || /^https?:\/\//.test(file)) return null
    try {
        return imageSize(new Uint8Array(await readFile(path.join(REPO_ROOT, file))))
    } catch {
        return null
    }
}

const manifests = JSON.parse(await readRepoFile('manifest.json'))
const releaseVersions = JSON.parse((await readOptional('.release-please-manifest.json')) ?? '{}')

async function syncExtension({ slug, order }) {
    const dir = `extensions/${slug}`
    // Marketplace paths in the root manifest are relative to the repo root.
    const manifest = manifests.find((entry) => entry.main?.startsWith(`${dir}/`))
    if (!manifest) throw new Error(`no entry in manifest.json with main under ${dir}/`)
    const [readme, changelog] = await Promise.all([readRepoFile(`${dir}/README.md`), readOptional(`${dir}/CHANGELOG.md`)])

    const version = releaseVersions[dir] ?? null
    const editUrl = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/edit/HEAD/${dir}/README.md`
    const preview = manifest.preview ? (/^https?:\/\//.test(manifest.preview) ? manifest.preview : rawUrl(manifest.preview)) : null
    const head = ogImageHead(preview, await previewSize(manifest.preview))

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
        }) + transformReadme(readme, { dir }),
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
            }) + transformReadme(changelog, { dir }),
        )
    }

    return {
        description: manifest.description,
        name: manifest.name,
        order,
        preview,
        repoUrl: `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/tree/HEAD/${dir}`,
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

const listed = new Set(EXTENSIONS.map(({ slug }) => `extensions/${slug}/`))
const unlisted = manifests.filter((entry) => ![...listed].some((dir) => entry.main?.startsWith(dir)))
if (unlisted.length > 0) {
    throw new Error(`manifest.json entries missing from src/data/extensions.mjs: ${unlisted.map((e) => e.main).join(', ')}`)
}

const results = await Promise.allSettled(EXTENSIONS.map(syncExtension))
const failures = results
    .map((result, index) => ({ extension: EXTENSIONS[index], result }))
    .filter(({ result }) => result.status === 'rejected')

if (failures.length > 0) {
    for (const { extension, result } of failures) {
        console.error(`[sync-extensions] ${extension.slug}: ${result.reason.message}`)
    }
    process.exit(1)
}

const summary = results.map((result) => result.value).sort((a, b) => a.order - b.order)
await writeFile(SUMMARY_FILE, `${JSON.stringify(summary, null, 2)}\n`)
console.log(`[sync-extensions] synced ${summary.length} extensions`)
