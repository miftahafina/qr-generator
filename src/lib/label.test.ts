import { describe, expect, it } from 'vitest'
import {
  applyLabelToSvgElement,
  composeSvgWithLabel,
  hasLabel,
  labelFontSize,
  layoutLabel,
  withLabelBlob,
  wrapLabelLines,
  type TextMeasure,
} from './label'
import { createQRCode } from './qr'
import { DEFAULT_CONFIG, type QRConfig } from '../types'

const measure: TextMeasure = (text) => text.length * 10

const labeledConfig: QRConfig = { ...DEFAULT_CONFIG, labelEnabled: true, labelText: 'Halo Dunia' }

const SVG_SOURCE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320"><rect width="320" height="320" fill="#ffffff"/></svg>'

describe('hasLabel', () => {
  it('aktif hanya bila di-enable dan ada teks', () => {
    expect(hasLabel(labeledConfig)).toBe(true)
    expect(hasLabel({ ...labeledConfig, labelEnabled: false })).toBe(false)
    expect(hasLabel({ ...labeledConfig, labelText: '   ' })).toBe(false)
  })
})

describe('wrapLabelLines', () => {
  it('membungkus teks menjadi beberapa baris', () => {
    expect(wrapLabelLines('Halo Dunia', 60, measure)).toEqual(['Halo', 'Dunia'])
  })

  it('memotong kata yang lebih panjang dari lebar maksimum', () => {
    expect(wrapLabelLines('aaaaaaaaaa', 30, measure)).toEqual(['aaa', 'aaa', 'aaa', 'a'])
  })

  it('menghormati baris baru eksplisit', () => {
    expect(wrapLabelLines('Halo\nDunia', 200, measure)).toEqual(['Halo', 'Dunia'])
  })
})

describe('layoutLabel', () => {
  it('menghitung ukuran font dan tinggi area label', () => {
    const layout = layoutLabel('Halo', 320, 16, () => measure)
    expect(layout.fontSize).toBe(labelFontSize(320))
    expect(layout.lines).toEqual(['Halo'])
    expect(layout.height).toBe(layout.topGap + layout.lineHeight + layout.bottomPadding)
    expect(layout.topGap).toBeLessThan(layout.bottomPadding)
  })
})

describe('composeSvgWithLabel', () => {
  it('menambahkan teks dan menambah tinggi SVG', () => {
    const result = composeSvgWithLabel(SVG_SOURCE, labeledConfig)
    const parsed = new DOMParser().parseFromString(result, 'image/svg+xml').documentElement
    const height = Number(parsed.getAttribute('height'))

    expect(parsed.querySelectorAll('text')).toHaveLength(1)
    expect(parsed.querySelector('text')?.textContent).toBe('Halo Dunia')
    expect(height).toBeGreaterThan(320)
    expect(parsed.getAttribute('viewBox')).toBe(`0 0 320 ${height}`)
  })

  it('tidak mengubah SVG bila label nonaktif', () => {
    expect(composeSvgWithLabel(SVG_SOURCE, DEFAULT_CONFIG)).toContain('width="320"')
  })
})

describe('applyLabelToSvgElement', () => {
  it('memakai warna latar untuk area label bila tidak transparan', () => {
    const parsed = new DOMParser().parseFromString(SVG_SOURCE, 'image/svg+xml')
    const svg = parsed.documentElement as unknown as SVGSVGElement
    applyLabelToSvgElement(svg, labeledConfig)
    const rects = svg.querySelectorAll('rect')
    expect(rects).toHaveLength(2)
  })

  it('melewati latar label saat transparan', () => {
    const parsed = new DOMParser().parseFromString(SVG_SOURCE, 'image/svg+xml')
    const svg = parsed.documentElement as unknown as SVGSVGElement
    applyLabelToSvgElement(svg, { ...labeledConfig, transparentBackground: true })
    expect(svg.querySelectorAll('rect')).toHaveLength(1)
  })
})

describe('withLabelBlob', () => {
  const fakeQr = (blob: Blob) =>
    ({ getRawData: async () => blob }) as unknown as Parameters<typeof withLabelBlob>[0]

  it('mengembalikan blob apa adanya bila label nonaktif', async () => {
    const blob = await withLabelBlob(
      fakeQr(new Blob(['qr'], { type: 'image/png' })),
      DEFAULT_CONFIG,
      'png',
    )
    expect(await blob.text()).toBe('qr')
  })

  it('menyisipkan label pada unduhan SVG', async () => {
    const blob = await withLabelBlob(
      fakeQr(new Blob([SVG_SOURCE], { type: 'image/svg+xml' })),
      labeledConfig,
      'svg',
    )
    expect(await blob.text()).toContain('Halo Dunia')
  })

  it('menggabungkan label dengan QR sungguhan', async () => {
    const qr = createQRCode({ ...labeledConfig, data: 'https://contoh.com' })
    const blob = await withLabelBlob(qr, labeledConfig, 'svg')
    const svg = await blob.text()
    expect(svg).toContain('<svg')
    expect(svg).toContain('Halo Dunia')
  })
})
