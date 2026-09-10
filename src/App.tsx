import { useCallback, useEffect, useState } from 'react'
import { QRForm } from './components/QRForm'
import { QRPreview } from './components/QRPreview'
import { ThemeToggle } from './components/ThemeToggle'
import { usePersistentConfig } from './hooks/usePersistentConfig'
import { useTheme } from './hooks/useTheme'
import {
  copyImageToClipboard,
  createQRCode,
  fileNameFor,
  getDownloadBlob,
  triggerDownload,
  type ExportFormat,
} from './lib/qr'
import type { QRConfig } from './types'

type BusyAction = ExportFormat | 'copy'

export default function App() {
  const { theme, toggle } = useTheme()
  const [config, setConfig] = usePersistentConfig()
  const [busy, setBusy] = useState<BusyAction | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const updateConfig = useCallback(
    (patch: Partial<QRConfig>) => {
      setConfig((current) => ({ ...current, ...patch }))
    },
    [setConfig],
  )

  const download = useCallback(
    async (format: ExportFormat) => {
      setBusy(format)
      setError(null)
      try {
        const qr = createQRCode(config)
        const blob = await getDownloadBlob(qr, format)
        triggerDownload(blob, fileNameFor(config.data, format))
      } catch {
        setError('Gagal membuat file. Coba lagi.')
      } finally {
        setBusy(null)
      }
    },
    [config],
  )

  const copy = useCallback(async () => {
    setBusy('copy')
    setError(null)
    try {
      await copyImageToClipboard(createQRCode(config))
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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold">QR Code Generator</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              100% digenerate di browser Anda!
            </p>
          </div>
          <ThemeToggle theme={theme} onToggle={toggle} />
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-base font-semibold">Pengaturan</h2>
          <QRForm config={config} onChange={updateConfig} />
        </section>

        <section className="lg:sticky lg:top-8 lg:self-start">
          <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-base font-semibold">Pratinjau</h2>
            <QRPreview config={config} />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => download('png')}
                disabled={busy !== null}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy === 'png' ? 'Menyiapkan…' : 'Unduh PNG'}
              </button>
              <button
                type="button"
                onClick={() => download('svg')}
                disabled={busy !== null}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {busy === 'svg' ? 'Menyiapkan…' : 'Unduh SVG'}
              </button>
            </div>
            <button
              type="button"
              onClick={copy}
              disabled={busy !== null}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
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
              {busy === 'copy' ? 'Menyalin…' : copied ? 'Tersalin!' : 'Salin ke clipboard'}
            </button>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-5xl space-y-1 px-4 pb-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>Tanpa server, tanpa analytics, tanpa iklan. Semua QR dibuat lokal di perangkat kamu.</p>
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
