import { describe, expect, it, vi } from 'vitest'
import JSZip from 'jszip'
import { bulkRekapContent, createBulkZip, parseBulkContent } from './bulk'
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

describe('bulkRekapContent', () => {
  it('memetakan nomor urut ke konten mentah', () => {
    expect(bulkRekapContent(['https://a.com', ' halo '])).toBe(
      '0001 - https://a.com\n0002 - halo',
    )
  })
})

describe('createBulkZip', () => {
  const loadFiles = async (blob: Blob) => {
    const zip = await JSZip.loadAsync(await blob.arrayBuffer())
    return Object.keys(zip.files)
      .filter((name) => !name.endsWith('/'))
      .sort()
  }

  it('membuat satu file QR per entri dengan nomor urut', async () => {
    const blob = await createBulkZip(['https://a.com', 'https://b.com'], DEFAULT_CONFIG, 'png')
    expect(await loadFiles(blob)).toEqual([
      '0001 - a-com.png',
      '0002 - b-com.png',
      'daftar.txt',
    ])
  })

  it('memakai nomor urut unik untuk entri yang sama', async () => {
    const blob = await createBulkZip(['halo', 'halo'], DEFAULT_CONFIG, 'svg')
    expect(await loadFiles(blob)).toEqual(['0001 - halo.svg', '0002 - halo.svg', 'daftar.txt'])
  })

  it('zero-padding nomor urut', async () => {
    const blob = await createBulkZip(['x'], DEFAULT_CONFIG, 'png')
    expect(await loadFiles(blob)).toEqual(['0001 - x.png', 'daftar.txt'])
  })

  it('menyertakan daftar.txt berisi pemetaan nomor ke konten', async () => {
    const blob = await createBulkZip(['https://a.com', 'halo'], DEFAULT_CONFIG, 'png')
    const zip = await JSZip.loadAsync(await blob.arrayBuffer())
    const content = await zip.file('daftar.txt')?.async('string')
    expect(content).toBe('0001 - https://a.com\n0002 - halo')
  })
})