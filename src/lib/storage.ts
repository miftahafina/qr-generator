import type { DotStyle, ErrorCorrection, QRConfig, QRMode } from '../types'
import { DEFAULT_CONFIG } from '../types'

const STORAGE_KEY = 'qr-generator-config'
const MODE_KEY = 'qr-generator-mode'

const MODES: QRMode[] = ['single', 'bulk']

const DOT_STYLES: DotStyle[] = [
  'dots',
  'rounded',
  'classy',
  'classy-rounded',
  'square',
  'extra-rounded',
]

const ERROR_LEVELS: ErrorCorrection[] = ['L', 'M', 'Q', 'H']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, value))
}

function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)
}

export function parseConfig(raw: string | null): QRConfig {
  if (!raw) return DEFAULT_CONFIG

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return DEFAULT_CONFIG
  }

  if (!isRecord(parsed)) return DEFAULT_CONFIG

  return {
    data: typeof parsed.data === 'string' ? parsed.data : DEFAULT_CONFIG.data,
    size: clampNumber(parsed.size, 128, 1024, DEFAULT_CONFIG.size),
    margin: clampNumber(parsed.margin, 0, 64, DEFAULT_CONFIG.margin),
    fgColor: isHexColor(parsed.fgColor) ? parsed.fgColor : DEFAULT_CONFIG.fgColor,
    bgColor: isHexColor(parsed.bgColor) ? parsed.bgColor : DEFAULT_CONFIG.bgColor,
    transparentBackground:
      typeof parsed.transparentBackground === 'boolean'
        ? parsed.transparentBackground
        : DEFAULT_CONFIG.transparentBackground,
    dotStyle: DOT_STYLES.includes(parsed.dotStyle as DotStyle)
      ? (parsed.dotStyle as DotStyle)
      : DEFAULT_CONFIG.dotStyle,
    errorCorrection: ERROR_LEVELS.includes(parsed.errorCorrection as ErrorCorrection)
      ? (parsed.errorCorrection as ErrorCorrection)
      : DEFAULT_CONFIG.errorCorrection,
    logo:
      typeof parsed.logo === 'string' && parsed.logo.startsWith('data:image/') ? parsed.logo : null,
  }
}

export function loadConfig(): QRConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG
  try {
    return parseConfig(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return DEFAULT_CONFIG
  }
}

export function saveConfig(config: QRConfig): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    return
  }
}

export function loadMode(): QRMode {
  if (typeof window === 'undefined') return 'single'
  try {
    const value = window.localStorage.getItem(MODE_KEY) as QRMode
    return MODES.includes(value) ? value : 'single'
  } catch {
    return 'single'
  }
}

export function saveMode(mode: QRMode): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(MODE_KEY, mode)
  } catch {
    return
  }
}
