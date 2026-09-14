import JSZip from 'jszip'
import { baseNameFor, createQRCode, getDownloadBlob, type ExportFormat } from './qr'
import type { QRConfig } from '../types'

export function parseBulkContent(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

export async function createBulkZip(
  items: string[],
  config: QRConfig,
  format: ExportFormat,
): Promise<Blob> {
  const zip = new JSZip()
  const used = new Set<string>()

  for (const raw of items) {
    const data = raw.trim()
    const base = baseNameFor(data)
    let filename = `${base}.${format}`
    let counter = 2
    while (used.has(filename)) {
      filename = `${base}-${counter}.${format}`
      counter += 1
    }
    used.add(filename)

    const qr = createQRCode({ ...config, data })
    zip.file(filename, await getDownloadBlob(qr, format))
  }

  return zip.generateAsync({ type: 'blob' })
}

export function bulkZipFileName(): string {
  return `bulk-qrcodes-${Date.now()}.zip`
}