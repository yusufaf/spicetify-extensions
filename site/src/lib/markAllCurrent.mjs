// A guide can sit in the sidebar twice: under Guides and under its extension.
// Starlight marks only the first link to the current page as current, so the
// extension's copy stayed unhighlighted and its group collapsed (Starlight opens
// any group holding a current link). This marks every link to `pathname`.
// Paths are compared the way Starlight does, ignoring a trailing slash and
// percent-encoding.
const normalize = (path) => decodeURI(path).replace(/\/$/, '')

export function markAllCurrent(entries, pathname) {
    const target = normalize(pathname)
    for (const entry of entries) {
        if (entry.type === 'link') {
            if (normalize(entry.href) === target) entry.isCurrent = true
        } else {
            markAllCurrent(entry.entries, pathname)
        }
    }
}
