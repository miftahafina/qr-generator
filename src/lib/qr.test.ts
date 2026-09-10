import { afterEach, describe, expect, it, vi } from 'vitest'
import type QRCodeStyling from 'qr-code-styling'
import {
  buildOptions,
  canCopyImage,
  copyImageToClipboard,
  createQRCode,
  fileNameFor,
  getDownloadBlob,
} from './qr'
import { DEFAULT_CONFIG } from '../types'

describe('fileNameFor', () => {
  it('membuat nama file dari URL', () => {
    expect(fileNameFor('https://contoh.com/halaman', 'png')).toBe('contoh-com-halaman.png')
  })

  it('menghapus karakter yang tidak aman', () => {
    expect(fileNameFor('Halo Dunia!', 'svg')).toBe('halo-dunia.svg')
  })

  it('memakai fallback untuk input kosong', () => {
    expect(fileNameFor('   ', 'png')).toBe('qrcode.png')
  })
})

describe('buildOptions', () => {
  it('memetakan konfigurasi ke opsi qr-code-styling', () => {
    const options = buildOptions({
      ...DEFAULT_CONFIG,
      data: 'halo',
      size: 400,
      margin: 8,
      fgColor: '#000000',
      bgColor: '#ffffff',
      dotStyle: 'dots',
      errorCorrection: 'H',
    })

    expect(options.width).toBe(400)
    expect(options.height).toBe(400)
    expect(options.margin).toBe(8)
    expect(options.data).toBe('halo')
    expect(options.qrOptions?.errorCorrectionLevel).toBe('H')
    expect(options.dotsOptions).toEqual({ color: '#000000', type: 'dots' })
    expect(options.cornersSquareOptions?.type).toBe('dot')
    expect(options.backgroundOptions).toEqual({ color: '#ffffff' })
  })

  it('memakai spasi bila data kosong', () => {
    const options = buildOptions({ ...DEFAULT_CONFIG, data: '   ' })
    expect(options.data).toBe(' ')
  })

  it('meneruskan logo sebagai gambar', () => {
    const logo = 'data:image/png;base64,abc'
    const options = buildOptions({ ...DEFAULT_CONFIG, logo })
    expect(options.image).toBe(logo)
  })

  it('memakai latar transparan bila diaktifkan', () => {
    const options = buildOptions({ ...DEFAULT_CONFIG, transparentBackground: true })
    expect(options.backgroundOptions).toEqual({ color: 'transparent' })
  })
})

describe('createQRCode', () => {
  it('menghasilkan SVG QR yang valid', async () => {
    const qr = createQRCode({ ...DEFAULT_CONFIG, data: 'https://contoh.com' })
    const blob = await getDownloadBlob(qr, 'svg')
    const svg = await blob.text()

    expect(svg).toContain('<svg')
    expect(svg).toContain('</svg>')
  })
})

describe('clipboard', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  const fakeQr = (blob: Blob) =>
    ({ getRawData: vi.fn().mockResolvedValue(blob) }) as unknown as QRCodeStyling

  it('mendeteksi dukungan clipboard', () => {
    vi.stubGlobal('ClipboardItem', class {})
    vi.stubGlobal('navigator', { clipboard: { write: vi.fn() } })
    expect(canCopyImage()).toBe(true)
  })

  it('mengembalikan false bila tidak didukung', () => {
    vi.stubGlobal('ClipboardItem', undefined)
    vi.stubGlobal('navigator', { clipboard: undefined })
    expect(canCopyImage()).toBe(false)
  })

  it('menulis gambar PNG ke clipboard', async () => {
    const write = vi.fn().mockResolvedValue(undefined)
    const captured: Record<string, Blob | Promise<Blob>>[] = []
    class FakeClipboardItem {
      constructor(data: Record<string, Blob | Promise<Blob>>) {
        captured.push(data)
      }
    }
    vi.stubGlobal('ClipboardItem', FakeClipboardItem)
    vi.stubGlobal('navigator', { clipboard: { write } })

    await copyImageToClipboard(fakeQr(new Blob(['qr'], { type: 'image/png' })))

    expect(write).toHaveBeenCalledTimes(1)
    expect(captured).toHaveLength(1)
    const value = await captured[0]['image/png']
    expect(value).toBeInstanceOf(Blob)
    expect(value.type).toBe('image/png')
  })

  it('melempar bila clipboard gambar tidak didukung', async () => {
    vi.stubGlobal('ClipboardItem', undefined)
    vi.stubGlobal('navigator', { clipboard: undefined })

    await expect(copyImageToClipboard(fakeQr(new Blob(['qr'])))).rejects.toThrow(
      'Clipboard gambar tidak didukung browser ini',
    )
  })
})
