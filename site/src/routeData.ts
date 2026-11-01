import { defineRouteMiddleware } from '@astrojs/starlight/route-data'
import { EXTENSIONS, GUIDES_DIR } from './data/extensions.mjs'
import { markAllCurrent } from './lib/markAllCurrent.mjs'

// Entry ids of guides that also appear under an extension, the only pages listed
// twice in the sidebar.
const LISTED_GUIDES = new Set(EXTENSIONS.flatMap(({ guides = [] }) => guides.map((guide) => `${GUIDES_DIR}/${guide}`)))

export const onRequest = defineRouteMiddleware((context) => {
    const route = context.locals.starlightRoute
    if (!LISTED_GUIDES.has(route.entry.id)) return

    markAllCurrent(route.sidebar, context.url.pathname)

    // Previous/Next come from the first sidebar copy, the one under Guides, so
    // they wouldn't lead back to the extension the reader came from. Drop them,
    // unless the guide's frontmatter sets its own.
    if (route.entry.data.prev === undefined) route.pagination.prev = undefined
    if (route.entry.data.next === undefined) route.pagination.next = undefined
})
