import type QRCodeStyling from 'qr-code-styling'
import type { QRConfig } from '../types'
import { getDownloadBlob, type ExportFormat } from './qr'

export const LABEL_FONT_FAMILY =
  'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
const LABEL_FONT_RATIO = 0.055
const LABEL_LINE_HEIGHT_RATIO = 1.3
const LABEL_TOP_GAP_RATIO = 0.018
const LABEL_BOTTOM_PADDING_RATIO = 0.045
const LABEL_FONT_WEIGHT = '600'
const SVG_NS = 'http://www.w3.org/2000/svg'

export type TextMeasure = (text: string) => number

export interface LabelLayout {
  lines: string[]
  fontSize: number
  lineHeight: number
  topGap: number
  bottomPadding: number
  height: number
}

export function hasLabel(config: QRConfig): boolean {
  return config.labelEnabled && config.labelText.trim() !== ''
}

export function labelFontSize(size: number): number {
  return Math.max(12, Math.round(size * LABEL_FONT_RATIO))
}

let measureCanvas: HTMLCanvasElement | null = null

function fallbackMeasure(fontSize: number): TextMeasure {
  return (text) => text.length * fontSize * 0.6
}

export function createTextMeasure(fontSize: number): TextMeasure {
  if (typeof document === 'undefined') return fallbackMeasure(fontSize)
  measureCanvas ??= document.createElement('canvas')
  const context = measureCanvas.getContext('2d')
  if (!context) return fallbackMeasure(fontSize)
  context.font = `${LABEL_FONT_WEIGHT} ${fontSize}px ${LABEL_FONT_FAMILY}`
  return (text) => context.measureText(text).width
}

export function wrapLabelLines(text: string, maxWidth: number, measure: TextMeasure): string[] {
  const paragraphs = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
  const source = paragraphs.length > 0 ? paragraphs : [text.trim()]
  const lines: string[] = []

  for (const paragraph of source) {
    const words = paragraph.split(/\s+/).filter(Boolean)
    let current = ''
    for (const word of words) {
      const candidate = current === '' ? word : `${current} ${word}`
      if (current === '' || measure(candidate) <= maxWidth) {
        current = candidate
      } else {
        lines.push(current)
        current = word
      }
      while (measure(current) > maxWidth && current.length > 1) {
        let cut = current.length - 1
        while (cut > 1 && measure(current.slice(0, cut)) > maxWidth) cut -= 1
        lines.push(current.slice(0, cut))
        current = current.slice(cut)
      }
    }
    if (current !== '') lines.push(current)
  }

  return lines.length > 0 ? lines : ['']
}

export function layoutLabel(
  text: string,
  size: number,
  margin: number,
  createMeasure: (fontSize: number) => TextMeasure = createTextMeasure,
): LabelLayout {
  const fontSize = labelFontSize(size)
  const lineHeight = Math.round(fontSize * LABEL_LINE_HEIGHT_RATIO)
  const topGap = Math.max(4, Math.round(size * LABEL_TOP_GAP_RATIO))
  const bottomPadding = Math.max(12, Math.round(size * LABEL_BOTTOM_PADDING_RATIO))
  const maxWidth = Math.max(1, size - 2 * margin)
  const lines = wrapLabelLines(text, maxWidth, createMeasure(fontSize))
  return {
    lines,
    fontSize,
    lineHeight,
    topGap,
    bottomPadding,
    height: topGap + lines.length * lineHeight + bottomPadding,
  }
}

function svgDimension(svg: SVGSVGElement, name: 'width' | 'height'): number {
  const attribute = Number.parseFloat(svg.getAttribute(name) ?? '')
  if (Number.isFinite(attribute) && attribute > 0) return attribute
  const viewBox = svg.getAttribute('viewBox')
  if (viewBox) {
    const parts = viewBox.split(/\s+/).filter(Boolean).map(Number)
    const value = parts[name === 'width' ? 2 : 3]
    if (Number.isFinite(value) && value > 0) return value
  }
  return 0
}

export function applyLabelToSvgElement(svg: SVGSVGElement, config: QRConfig): void {
  if (!hasLabel(config)) return
  const width = svgDimension(svg, 'width')
  const height = svgDimension(svg, 'height')
  if (width <= 0 || height <= 0) return

  const layout = layoutLabel(config.labelText.trim(), height, config.margin)
  const newHeight = height + layout.height
  const doc = svg.ownerDocument

  svg.setAttribute('height', String(newHeight))
  svg.setAttribute('viewBox', `0 0 ${width} ${newHeight}`)

  if (!config.transparentBackground) {
    const background = doc.createElementNS(SVG_NS, 'rect')
    background.setAttribute('x', '0')
    background.setAttribute('y', String(height))
    background.setAttribute('width', String(width))
    background.setAttribute('height', String(layout.height))
    background.setAttribute('fill', config.bgColor)
    svg.appendChild(background)
  }

  layout.lines.forEach((line, index) => {
    const text = doc.createElementNS(SVG_NS, 'text')
    text.setAttribute('x', String(width / 2))
    text.setAttribute(
      'y',
      String(height + layout.topGap + index * layout.lineHeight + layout.fontSize),
    )
    text.setAttribute('text-anchor', 'middle')
    text.setAttribute('font-family', LABEL_FONT_FAMILY)
    text.setAttribute('font-size', String(layout.fontSize))
    text.setAttribute('font-weight', LABEL_FONT_WEIGHT)
    text.setAttribute('fill', config.fgColor)
    text.textContent = line
    svg.appendChild(text)
  })
}

export function composeSvgWithLabel(svgText: string, config: QRConfig): string {
  if (typeof DOMParser === 'undefined') return svgText
  const parsed = new DOMParser().parseFromString(svgText, 'image/svg+xml')
  const svg = parsed.documentElement
  if (!svg || svg.tagName.toLowerCase() !== 'svg') return svgText
  applyLabelToSvgElement(svg as unknown as SVGSVGElement, config)
  return new XMLSerializer().serializeToString(svg)
}

export function composePngWithLabel(png: Blob, config: QRConfig): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('Canvas tidak tersedia'))
      return
    }
    const source = URL.createObjectURL(png)
    const image = new Image()
    image.onload = () => {
      try {
        const qrWidth = image.naturalWidth || image.width
        const qrHeight = image.naturalHeight || image.height
        const layout = layoutLabel(config.labelText.trim(), qrHeight, config.margin)
        const canvas = document.createElement('canvas')
        canvas.width = qrWidth
        canvas.height = qrHeight + layout.height
        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('Canvas tidak tersedia'))
          return
        }
        if (!config.transparentBackground) {
          context.fillStyle = config.bgColor
          context.fillRect(0, 0, canvas.width, canvas.height)
        }
        context.drawImage(image, 0, 0)
        context.fillStyle = config.fgColor
        context.font = `${LABEL_FONT_WEIGHT} ${layout.fontSize}px ${LABEL_FONT_FAMILY}`
        context.textAlign = 'center'
        context.textBaseline = 'alphabetic'
        layout.lines.forEach((line, index) => {
          const y = qrHeight + layout.topGap + index * layout.lineHeight + layout.fontSize
          context.fillText(line, canvas.width / 2, y)
        })
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Gagal membuat PNG berlabel'))
        }, 'image/png')
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Gagal membuat PNG berlabel'))
      } finally {
        URL.revokeObjectURL(source)
      }
    }
    image.onerror = () => {
      URL.revokeObjectURL(source)
      reject(new Error('Gagal memuat gambar QR'))
    }
    image.src = source
  })
}

export async function withLabelBlob(
  qr: QRCodeStyling,
  config: QRConfig,
  format: ExportFormat,
): Promise<Blob> {
  if (!hasLabel(config)) return getDownloadBlob(qr, format)
  if (format === 'svg') {
    const base = await getDownloadBlob(qr, 'svg')
    const svg = await base.text()
    return new Blob([composeSvgWithLabel(svg, config)], { type: 'image/svg+xml' })
  }
  const base = await getDownloadBlob(qr, 'png')
  return composePngWithLabel(base, config)
}
