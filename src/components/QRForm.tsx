import type { ChangeEvent } from 'react'
import type { DotStyle, ErrorCorrection, QRConfig } from '../types'
import { ColorField } from './ColorField'

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
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900'

const labelClass = 'text-sm font-medium text-slate-700 dark:text-slate-200'

export function QRForm({ config, onChange }: Props) {
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
          placeholder="https://contoh.com"
          className={`${inputClass} resize-y font-mono`}
        />
      </div>

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
          className="w-full accent-indigo-600"
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
          className="w-full accent-indigo-600"
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
          onChange={(bgColor) => onChange({ bgColor })}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="qr-dot" className={labelClass}>
          Bentuk titik
        </label>
        <select
          id="qr-dot"
          value={config.dotStyle}
          onChange={(event) => onChange({ dotStyle: event.target.value as DotStyle })}
          className={inputClass}
        >
          {DOT_STYLES.map((style) => (
            <option key={style.value} value={style.value}>
              {style.label}
            </option>
          ))}
        </select>
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
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-500 dark:text-slate-300"
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
    </form>
  )
}
