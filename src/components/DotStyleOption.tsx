import { useEffect, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'
import { cornerStyleFor } from '../lib/qr'
import type { DotStyle } from '../types'

interface Props {
  style: DotStyle
  label: string
  selected: boolean
  onSelect: (style: DotStyle) => void
}

const SAMPLE_COLOR = '#64748b'
const SAMPLE_DATA = '1'

export function DotStyleOption({ style, label, selected, onSelect }: Props) {
  const containerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const qr = new QRCodeStyling({
      type: 'svg',
      width: 80,
      height: 80,
      margin: 2,
      data: SAMPLE_DATA,
      qrOptions: { errorCorrectionLevel: 'L' },
      dotsOptions: { color: SAMPLE_COLOR, type: style },
      cornersSquareOptions: { color: SAMPLE_COLOR, type: cornerStyleFor(style) },
      cornersDotOptions: { color: SAMPLE_COLOR },
      backgroundOptions: { color: 'transparent' },
    })

    container.innerHTML = ''
    qr.append(container)

    return () => {
      container.innerHTML = ''
    }
  }, [style])

  return (
    <button
      type="button"
      onClick={() => onSelect(style)}
      aria-pressed={selected}
      aria-label={label}
      title={label}
      className={`flex flex-col items-center gap-1.5 rounded-lg border p-2 transition ${
        selected
          ? 'border-primary bg-primary/10 dark:border-primary-light dark:bg-primary/20'
          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800'
      }`}
    >
      <span
        ref={containerRef}
        aria-hidden="true"
        className="h-12 w-12 [&>svg]:h-full [&>svg]:w-full"
      />
      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{label}</span>
    </button>
  )
}
