import { describe, expect, it } from 'vitest'
import { imageSize, ogImageHead } from '../src/lib/ogImage.mjs'

const png = (width, height) => {
    const bytes = new Uint8Array(24)
    bytes.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52])
    const view = new DataView(bytes.buffer)
    view.setUint32(16, width)
    view.setUint32(20, height)
    return bytes
}

const jpeg = (width, height) => {
    // SOI, an APP0 segment to skip over, then SOF0 with height and width.
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 4, 0, 0, 0xff, 0xc0, 0, 11, 8, 0, 0, 0, 0, 3, 0, 0, 0])
    const view = new DataView(bytes.buffer)
    view.setUint16(13, height)
    view.setUint16(15, width)
    return bytes
}

const URL = 'https://raw.githubusercontent.com/yusufaf/x/HEAD/preview.png'
const content = (head, key) => head.find(({ attrs }) => Object.values(attrs).includes(key))?.attrs.content

describe('imageSize', () => {
    it('reads PNG dimensions', () => expect(imageSize(png(840, 630))).toEqual({ height: 630, width: 840 }))
    it('reads JPEG dimensions past other segments', () => expect(imageSize(jpeg(1200, 900))).toEqual({ height: 900, width: 1200 }))
    it('returns null for other formats', () => expect(imageSize(new TextEncoder().encode('GIF89a......'))).toBeNull())
})

describe('ogImageHead', () => {
    it('skips previews under 600px on the short side', () => {
        expect(ogImageHead(URL, { height: 196, width: 403 })).toEqual([])
    })

    it('skips missing previews and unknown sizes', () => {
        expect(ogImageHead(null, { height: 900, width: 900 })).toEqual([])
        expect(ogImageHead(URL, null)).toEqual([])
    })

    it('uses a large landscape preview with the default large card', () => {
        const head = ogImageHead(URL, { height: 878, width: 1320 })
        expect(content(head, 'og:image')).toBe(URL)
        expect(content(head, 'og:image:width')).toBe('1320')
        expect(content(head, 'twitter:image')).toBe(URL)
        expect(content(head, 'twitter:card')).toBeUndefined()
    })

    it('switches square previews to the summary card', () => {
        expect(content(ogImageHead(URL, { height: 840, width: 840 }), 'twitter:card')).toBe('summary')
    })
})
