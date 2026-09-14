import type { DotType, ErrorCorrectionLevel } from 'qr-code-styling'
import type { ExportFormat } from './lib/qr'

export type DotStyle = DotType
export type ErrorCorrection = ErrorCorrectionLevel

export type BusyAction = ExportFormat | 'copy'

export interface QRConfig {
  data: string
  size: number
  margin: number
  fgColor: string
  bgColor: string
  transparentBackground: boolean
  dotStyle: DotStyle
  errorCorrection: ErrorCorrectionLevel
  logo: string | null
}

export type QRMode = 'single' | 'bulk'

export const DEFAULT_CONFIG: QRConfig = {
  data: '',
  size: 320,
  margin: 16,
  fgColor: '#111827',
  bgColor: '#ffffff',
  transparentBackground: false,
  dotStyle: 'square',
  errorCorrection: 'M',
  logo: null,
}
