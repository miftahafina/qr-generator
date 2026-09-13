import { useState } from 'react'
import type { ChangeEvent } from 'react'
import type { DotStyle, ErrorCorrection, QRConfig } from '../types'
import { ColorField } from './ColorField'
import { DotStyleOption } from './DotStyleOption'

interface Props {
  config: QRConfig
  onChange: (patch: Partial<QRConfig>) => void
}

const DOT_STYLES: { value: DotStyle; label: string }[] = [
  { value: 'square', label: 'Kotak' },
  { value: 'dots', label: 'Titik' },
  { value: 'rounded', label: 'Membulat' },
  { value: 'extra-rounded', label: 'Sangat membulat' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy membulat' },
]

const ERROR_LEVELS: { value: ErrorCorrection; label: string }[] = [
  { value: 'L', label: 'L — rendah (~7%)' },
  { value: 'M', label: 'M — sedang (~15%)' },
  { value: 'Q', label: 'Q — tinggi (~25%)' },
  { value: 'H', label: 'H — maksimal (~30%)' },
]

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary-light dark:focus:ring-primary/40'

const labelClass = 'text-sm font-medium text-slate-700 dark:text-slate-200'

export function QRForm({ config, onChange }: Props) {
  const [showCustomization, setShowCustomization] = useState(false)
  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange({ logo: reader.result, errorCorrection: 'H' })
      }
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  return (
    <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
      <div className="space-y-2">
        <label htmlFor="qr-data" className={labelClass}>
          Teks atau URL
        </label>
        <textarea
          id="qr-data"
          value={config.data}
          onChange={(event) => onChange({ data: event.target.value })}
          rows={3}
          spellCheck={false}
          placeholder="Masukkan teks atau URL"
          className={`${inputClass} resize-y font-mono`}
        />
      </div>

      <button
        type="button"
        onClick={() => setShowCustomization((v) => !v)}
        aria-expanded={showCustomization}
        className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        <span className="flex items-center gap-2">
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
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          <span>Pengaturan kustomisasi</span>
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 text-slate-400 transition-transform duration-200 dark:text-slate-500"
          style={{ transform: showCustomization ? 'rotate(180deg)' : 'rotate(0)' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {showCustomization && (
        <div className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="qr-size" className={labelClass}>
              Ukuran <span className="text-slate-500 dark:text-slate-400">({config.size}px)</span>
            </label>
            <input
              id="qr-size"
              type="range"
              min={128}
              max={1024}
              step={16}
              value={config.size}
              onChange={(event) => onChange({ size: Number(event.target.value) })}
              className="w-full accent-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="qr-margin" className={labelClass}>
              Margin <span className="text-slate-500 dark:text-slate-400">({config.margin}px)</span>
            </label>
            <input
              id="qr-margin"
              type="range"
              min={0}
              max={64}
              step={2}
              value={config.margin}
              onChange={(event) => onChange({ margin: Number(event.target.value) })}
              className="w-full accent-primary"
            />
          </div>

          <div className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
            <ColorField
              id="qr-fg"
              label="Warna QR"
              value={config.fgColor}
              onChange={(fgColor) => onChange({ fgColor })}
            />
            <ColorField
              id="qr-bg"
              label="Warna latar"
              value={config.bgColor}
              disabled={config.transparentBackground}
              onChange={(bgColor) => onChange({ bgColor })}
            />
            <label
              htmlFor="qr-transparent"
              className="flex items-center gap-2 border-t border-slate-200 pt-3 dark:border-slate-800"
            >
              <input
                id="qr-transparent"
                type="checkbox"
                checked={config.transparentBackground}
                onChange={(event) => onChange({ transparentBackground: event.target.checked })}
                className="h-4 w-4 accent-primary"
              />
              <span className={labelClass}>Latar transparan</span>
            </label>
          </div>

          <div className="space-y-2">
            <span className={labelClass}>Bentuk titik</span>
            <div role="group" aria-label="Bentuk titik" className="grid grid-cols-3 gap-2">
              {DOT_STYLES.map((style) => (
                <DotStyleOption
                  key={style.value}
                  style={style.value}
                  label={style.label}
                  selected={config.dotStyle === style.value}
                  onSelect={(dotStyle) => onChange({ dotStyle })}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="qr-error" className={labelClass}>
              Koreksi error
            </label>
            <select
              id="qr-error"
              value={config.errorCorrection}
              onChange={(event) => onChange({ errorCorrection: event.target.value as ErrorCorrection })}
              className={inputClass}
            >
              {ERROR_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Koreksi error menentukan seberapa tahan QR terhadap kerusakan. Level lebih tinggi tetap
              terbaca walau sebagian tertutup, tetapi QR jadi lebih padat.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="qr-logo" className={labelClass}>
              Logo (opsional)
            </label>
            <div className="flex items-center gap-3">
              <input
                id="qr-logo"
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleLogoChange}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-primary-hover dark:text-slate-300"
              />
              {config.logo && (
                <button
                  type="button"
                  onClick={() => onChange({ logo: null })}
                  className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Hapus
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Menambahkan logo otomatis memakai koreksi error H.
            </p>
          </div>
        </div>
      )}
    </form>
  )
}
