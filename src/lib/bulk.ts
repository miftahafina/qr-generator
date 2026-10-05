import JSZip from 'jszip'
import { baseNameFor, createQRCode, type ExportFormat } from './qr'
import { withLabelBlob } from './label'
import type { QRConfig } from '../types'

export const MAX_BULK_ENTRIES = 1000

export function parseBulkContent(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

export function parseBulkLabels(text: string): string[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim())
  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop()
  return lines
}

export function bulkRekapContent(items: string[]): string {
  return items
    .map((item, index) => `${String(index + 1).padStart(4, '0')} - ${item.trim()}`)
    .join('\n')
}

export async function createBulkZip(
  items: string[],
  config: QRConfig,
  format: ExportFormat,
  labels: string[] = [],
): Promise<Blob> {
  const zip = new JSZip()

  for (let i = 0; i < items.length; i++) {
    const data = items[i].trim()
    const number = String(i + 1).padStart(4, '0')
    const filename = `${number} - ${baseNameFor(data)}.${format}`
    const label = labels[i]?.trim() ?? ''
    const itemConfig: QRConfig =
      label === '' ? config : { ...config, labelEnabled: true, labelText: label }

    const qr = createQRCode({ ...itemConfig, data })
    zip.file(filename, await withLabelBlob(qr, itemConfig, format))
  }

  zip.file('daftar.txt', bulkRekapContent(items))

  return zip.generateAsync({ type: 'blob' })
}

export function bulkZipFileName(): string {
  return `bulk-qrcodes-${Date.now()}.zip`
}
