import { useEffect, useRef } from 'react'
import { buildOptions } from '../lib/qr'
import QRCodeStyling from 'qr-code-styling'
import type { QRConfig } from '../types'

interface Props {
  config: QRConfig
}

export function QRPreview({ config }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const qr = new QRCodeStyling(buildOptions(config))
    container.innerHTML = ''
    qr.append(container)

    return () => {
      container.innerHTML = ''
    }
  }, [config])

  return (
    <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
      <div
        ref={containerRef}
        role="img"
        aria-label="Pratinjau QR code"
        className="w-full max-w-[320px] [&>canvas]:h-auto [&>canvas]:w-full [&>svg]:h-auto [&>svg]:w-full"
      />
    </div>
  )
}
