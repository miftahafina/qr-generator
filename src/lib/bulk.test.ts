import { describe, expect, it, vi } from 'vitest'
import JSZip from 'jszip'
import { createBulkZip, parseBulkContent } from './bulk'
import { DEFAULT_CONFIG } from '../types'

vi.mock('qr-code-styling', () => ({
  default: class {
    async getRawData() {
      return new Blob(['qr'], { type: 'image/png' })
    }
  },
}))

describe('parseBulkContent', () => {
  it('memisah baris, memangkas spasi, dan membuang baris kosong', () => {
    expect(
      parseBulkContent('https://a.com\n\n  halo  \r\nhttps://b.com'),
    ).toEqual(['https://a.com', 'halo', 'https://b.com'])
  })

  it('mengembalikan array kosong untuk teks kosong', () => {
    expect(parseBulkContent('\n\n  \n')).toEqual([])
  })
})

describe('createBulkZip', () => {
  const loadFiles = async (blob: Blob) => {
    const zip = await JSZip.loadAsync(await blob.arrayBuffer())
    return Object.keys(zip.files)
      .filter((name) => !name.endsWith('/'))
      .sort()
  }

  it('membuat satu file QR per entri', async () => {
    const blob = await createBulkZip(['https://a.com', 'https://b.com'], DEFAULT_CONFIG, 'png')
    expect(await loadFiles(blob)).toEqual(['a-com.png', 'b-com.png'])
  })

  it('membuat nama file unik untuk entri yang sama', async () => {
    const blob = await createBulkZip(['halo', 'halo'], DEFAULT_CONFIG, 'svg')
    expect(await loadFiles(blob)).toEqual(['halo-2.svg', 'halo.svg'])
  })
})