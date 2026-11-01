// Social-card metadata for generated extension pages, decided at sync time from the
// preview image's real dimensions.

/** Previews smaller than this on their short side fall back to the site-wide og.png. */
export const MIN_SHORT_SIDE = 600

/** Width/height ratio range treated as square, which gets `twitter:card=summary`. */
const SQUARE_RANGE = [0.8, 1.25]

/**
 * Read width and height from PNG or JPEG bytes. Returns null for anything else.
 * @param {Uint8Array} bytes
 * @returns {{ width: number, height: number } | null}
 */
export function imageSize(bytes) {
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
    // PNG: 8-byte signature, then the IHDR chunk with big-endian width and height.
    if (bytes.length >= 24 && view.getUint32(0) === 0x89504e47 && view.getUint32(12) === 0x49484452) {
        return { height: view.getUint32(20), width: view.getUint32(16) }
    }
    // JPEG: walk the segments to the first start-of-frame marker.
    if (bytes.length >= 4 && view.getUint16(0) === 0xffd8) {
        let offset = 2
        while (offset + 9 < bytes.length) {
            if (bytes[offset] !== 0xff) return null
            const marker = bytes[offset + 1]
            const length = view.getUint16(offset + 2)
            const isStartOfFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)
            if (isStartOfFrame) return { height: view.getUint16(offset + 5), width: view.getUint16(offset + 7) }
            offset += 2 + length
        }
    }
    return null
}

/**
 * Starlight `head` entries that make a preview the page's og:image, or an empty list when
 * the preview is missing, unreadable or too small (the site default then applies).
 * @param {string | null} url
 * @param {{ width: number, height: number } | null} size
 */
export function ogImageHead(url, size) {
    if (!url || !size || Math.min(size.width, size.height) < MIN_SHORT_SIDE) return []
    const meta = (key, name, content) => ({ attrs: { [key]: name, content: String(content) }, tag: 'meta' })
    const ratio = size.width / size.height
    const square = ratio >= SQUARE_RANGE[0] && ratio <= SQUARE_RANGE[1]
    return [
        meta('property', 'og:image', url),
        meta('property', 'og:image:width', size.width),
        meta('property', 'og:image:height', size.height),
        meta('name', 'twitter:image', url),
        ...(square ? [meta('name', 'twitter:card', 'summary')] : []),
    ]
}
