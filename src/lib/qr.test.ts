import { describe, expect, it } from 'vitest'
import { buildOptions, createQRCode, fileNameFor, getDownloadBlob } from './qr'
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
