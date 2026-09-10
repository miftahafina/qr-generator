import { useEffect, useState } from 'react'
import { loadConfig, saveConfig } from '../lib/storage'
import type { QRConfig } from '../types'

export function usePersistentConfig() {
  const [config, setConfig] = useState<QRConfig>(loadConfig)

  useEffect(() => {
    const timeout = window.setTimeout(() => saveConfig(config), 300)
    return () => window.clearTimeout(timeout)
  }, [config])

  return [config, setConfig] as const
}
