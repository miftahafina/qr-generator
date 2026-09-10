import { useEffect, useRef, useState } from 'react'
import type { ExportFormat } from '../lib/qr'
import type { BusyAction } from '../types'

interface Props {
  busy: BusyAction | null
  onDownload: (format: ExportFormat) => void
}

const FORMATS: { value: ExportFormat; label: string }[] = [
  { value: 'png', label: 'PNG' },
  { value: 'svg', label: 'SVG' },
]

export function DownloadMenu({ busy, onDownload }: Props) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const disabled = busy !== null

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const select = (format: ExportFormat) => {
    setOpen(false)
    onDownload(format)
  }

  return (
    <div ref={containerRef} className="relative flex flex-1">
      <button
        type="button"
        onClick={() => onDownload('png')}
        disabled={disabled}
        className="inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-l-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
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
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
        {busy === 'png' || busy === 'svg' ? 'Menyiapkan…' : 'Unduh'}
      </button>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Opsi format unduhan"
        className="inline-flex items-center justify-center rounded-r-lg border-l border-indigo-500 bg-indigo-600 px-2.5 text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
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
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-10 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
          {FORMATS.map((format) => (
            <button
              key={format.value}
              type="button"
              role="menuitem"
              onClick={() => select(format.value)}
              className="block w-full px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {format.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
