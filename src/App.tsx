import { useCallback, useEffect, useMemo, useState } from 'react'
import { DownloadMenu } from './components/DownloadMenu'
import { QRForm } from './components/QRForm'
import { QRPreview } from './components/QRPreview'
import { ThemeToggle } from './components/ThemeToggle'
import { usePersistentConfig } from './hooks/usePersistentConfig'
import { useTheme } from './hooks/useTheme'
import {
  copyImageToClipboard,
  createQRCode,
  fileNameFor,
  triggerDownload,
  type ExportFormat,
} from './lib/qr'
import { withLabelBlob } from './lib/label'
import {
  MAX_BULK_ENTRIES,
  bulkZipFileName,
  createBulkZip,
  parseBulkContent,
  parseBulkLabels,
} from './lib/bulk'
import { loadMode, saveMode } from './lib/storage'
import { buildPayload } from './lib/payload'
import { DEFAULT_CONFIG, type BusyAction, type QRConfig, type QRMode } from './types'

export default function App() {
  const { theme, toggle } = useTheme()
  const [config, setConfig] = usePersistentConfig()
  const [mode, setMode] = useState<QRMode>(loadMode)
  const [bulkSource, setBulkSource] = useState<'file' | 'paste'>('file')
  const [pasteText, setPasteText] = useState('')
  const [bulkLabelsText, setBulkLabelsText] = useState('')
  const [bulkItems, setBulkItems] = useState<string[]>([])
  const [bulkFileName, setBulkFileName] = useState<string | null>(null)
  const [busy, setBusy] = useState<BusyAction | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [bulkFileError, setBulkFileError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    saveMode(mode)
  }, [mode])

  const updateConfig = useCallback(
    (patch: Partial<QRConfig>) => {
      setConfig((current) => ({ ...current, ...patch }))
    },
    [setConfig],
  )

  const handleModeChange = useCallback((nextMode: QRMode) => {
    setMode(nextMode)
    setError(null)
    setBulkFileError(null)
  }, [])

  const handleBulkFile = useCallback(async (file: File) => {
    try {
      const text = await file.text()
      const items = parseBulkContent(text)
      if (items.length === 0) {
        setBulkFileError('File kosong atau tidak berisi teks valid')
        setBulkItems([])
        setBulkFileName(null)
        return
      }
      if (items.length > MAX_BULK_ENTRIES) {
        setBulkFileError(`Maksimal ${MAX_BULK_ENTRIES} entri per file (file ini ${items.length}).`)
        setBulkItems([])
        setBulkFileName(null)
        return
      }
      setBulkItems(items)
      setBulkFileName(file.name)
      setBulkFileError(null)
    } catch {
      setBulkFileError('Gagal membaca file. Coba lagi.')
    }
  }, [])

  const handleBulkSourceChange = useCallback(
    (nextSource: 'file' | 'paste') => {
      setBulkSource(nextSource)
      setBulkFileError(null)
      if (nextSource === 'paste') {
        setPasteText((current) => (current === '' ? bulkItems.join('\n') : current))
      }
    },
    [bulkItems],
  )

  const handleBulkText = useCallback((text: string) => {
    setPasteText(text)
    const items = parseBulkContent(text)
    if (items.length === 0) {
      setBulkItems([])
      setBulkFileName(null)
      setBulkFileError(null)
      return
    }
    if (items.length > MAX_BULK_ENTRIES) {
      setBulkFileError(`Maksimal ${MAX_BULK_ENTRIES} entri per file (file ini ${items.length}).`)
      setBulkItems([])
      setBulkFileName(null)
      return
    }
    setBulkItems(items)
    setBulkFileName(null)
    setBulkFileError(null)
  }, [])

  const handleBulkLabelsChange = useCallback((text: string) => {
    setBulkLabelsText(text)
  }, [])

  const bulkLabels = useMemo(() => parseBulkLabels(bulkLabelsText), [bulkLabelsText])

  const download = useCallback(
    async (format: ExportFormat) => {
      setBusy(format)
      setError(null)
      try {
        if (mode === 'bulk') {
          if (bulkItems.length === 0) {
            throw new Error('Pilih file berisi teks/URL untuk mode massal')
          }
          const blob = await createBulkZip(bulkItems, config, format, bulkLabels)
          triggerDownload(blob, bulkZipFileName())
        } else {
          const data = buildPayload(config)
          const qr = createQRCode({ ...config, data })
          const blob = await withLabelBlob(qr, config, format)
          triggerDownload(blob, fileNameFor(data, format))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal membuat file. Coba lagi.')
      } finally {
        setBusy(null)
      }
    },
    [config, mode, bulkItems, bulkLabels],
  )

  const copy = useCallback(async () => {
    setBusy('copy')
    setError(null)
    try {
      const qr = createQRCode({ ...config, data: buildPayload(config) })
      await copyImageToClipboard(await withLabelBlob(qr, config, 'png'))
      setCopied(true)
    } catch {
      setError('Gagal menyalin. Browser mungkin tidak mendukung.')
    } finally {
      setBusy(null)
    }
  }, [config])

  useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timeout)
  }, [copied])

  const resetAll = useCallback(() => {
    setConfig(DEFAULT_CONFIG)
    setMode('single')
    setBulkSource('file')
    setPasteText('')
    setBulkLabelsText('')
    setBulkItems([])
    setBulkFileName(null)
    setError(null)
    setBulkFileError(null)
    setCopied(false)
  }, [setConfig])

  const isBulk = mode === 'bulk'
  const payload = isBulk ? (bulkItems[0] ?? '') : buildPayload(config)
  const firstBulkLabel = bulkLabels[0]?.trim() ?? ''
  const previewConfig =
    isBulk && firstBulkLabel !== ''
      ? { ...config, data: payload, labelEnabled: true, labelText: firstBulkLabel }
      : { ...config, data: payload }
  const bulkReady = !isBulk || bulkItems.length > 0

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <div className="cursor-pointer">
            <h1 className="text-lg font-semibold">QR Code Generator</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              100% digenerate di browser Anda!
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/miftahafina/qr-generator"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Repositori GitHub"
              title="Repositori GitHub"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.68.8.56A11.01 11.01 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
              </svg>
            </a>
            <ThemeToggle theme={theme} onToggle={toggle} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">Pengaturan</h2>
              <button
                type="button"
                onClick={resetAll}
                aria-label="Atur ulang semua pengaturan"
                title="Atur ulang semua pengaturan"
                className="inline-flex items-center justify-center rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>
            </div>
            <QRForm
              config={config}
              onChange={updateConfig}
              mode={mode}
              onModeChange={handleModeChange}
              bulkSource={bulkSource}
              onBulkSourceChange={handleBulkSourceChange}
              pasteText={pasteText}
              onBulkTextChange={handleBulkText}
              bulkFileName={bulkFileName}
              bulkCount={bulkItems.length}
              onBulkFileChange={handleBulkFile}
              bulkFileError={bulkFileError}
              bulkLabelsText={bulkLabelsText}
              onBulkLabelsChange={handleBulkLabelsChange}
            />
          </section>

          <section className="lg:sticky lg:top-8 lg:self-start">
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-base font-semibold">
                Pratinjau{isBulk && bulkItems.length > 0 ? ' (entri pertama)' : ''}
              </h2>
              {isBulk && bulkItems.length === 0 ? (
                <div className="flex min-h-56 items-center justify-center rounded-xl border border-dashed border-slate-300 px-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Pilih file berisi teks/URL untuk melihat pratinjau dan mengunduh ZIP.
                </div>
              ) : (
                <QRPreview config={previewConfig} />
              )}
              <div className="flex items-stretch gap-3">
                <DownloadMenu
                  busy={busy}
                  onDownload={download}
                  label={isBulk ? 'Unduh ZIP' : 'Unduh'}
                  disabled={!bulkReady}
                />
                {!isBulk && (
                  <button
                    type="button"
                    onClick={copy}
                    disabled={busy !== null}
                    aria-label="Salin ke clipboard"
                    className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    {busy === 'copy' ? (
                      'Menyalin…'
                    ) : copied ? (
                      'Tersalin!'
                    ) : (
                      <>
                        <span className="sm:hidden">Salin</span>
                        <span className="hidden sm:inline">Salin ke clipboard</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            </div>
          </section>
        </div>
      </main>

      <footer className="mx-auto max-w-5xl space-y-1 px-4 pb-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>Tanpa server, tanpa analytics, tanpa iklan. Semua QR dibuat lokal di perangkat Anda.</p>
        <p>
          Oleh{' '}
          <a
            href="https://miftahafina.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-slate-700 dark:hover:text-slate-200"
          >
            Miftah Afina
          </a>{' '}
          dengan DeepSeek V4 Flash melalui OpenCode
        </p>
      </footer>
    </div>
  )
}
