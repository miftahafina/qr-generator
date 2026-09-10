import QRCodeStyling, { type Options } from 'qr-code-styling'
import type { DotStyle, QRConfig } from '../types'

export type ExportFormat = 'png' | 'svg'

function cornerStyleFor(dotStyle: DotStyle): 'square' | 'dot' | 'extra-rounded' {
  if (dotStyle === 'dots') return 'dot'
  if (dotStyle === 'square') return 'square'
  return 'extra-rounded'
}

export function buildOptions(config: QRConfig): Partial<Options> {
  return {
    type: 'canvas',
    width: config.size,
    height: config.size,
    margin: config.margin,
    data: config.data.trim() === '' ? ' ' : config.data,
    image: config.logo ?? undefined,
    qrOptions: { errorCorrectionLevel: config.errorCorrection },
    imageOptions: {
      saveAsBlob: false,
      crossOrigin: 'anonymous',
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 6,
    },
    dotsOptions: { color: config.fgColor, type: config.dotStyle },
    backgroundOptions: { color: config.bgColor },
    cornersSquareOptions: { color: config.fgColor, type: cornerStyleFor(config.dotStyle) },
    cornersDotOptions: { color: config.fgColor },
  }
}

export function createQRCode(config: QRConfig): QRCodeStyling {
  return new QRCodeStyling(buildOptions(config))
}

export async function getDownloadBlob(qr: QRCodeStyling, format: ExportFormat): Promise<Blob> {
  const raw = await qr.getRawData(format)
  if (!raw || !(raw instanceof Blob)) {
    throw new Error('Gagal membuat file QR')
  }
  return raw
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function fileNameFor(data: string, format: ExportFormat): string {
  const base = data
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  return `${base || 'qrcode'}.${format}`
}
