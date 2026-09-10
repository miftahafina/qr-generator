import type { DotType, ErrorCorrectionLevel } from 'qr-code-styling'

export type DotStyle = DotType
export type ErrorCorrection = ErrorCorrectionLevel

export interface QRConfig {
  data: string
  size: number
  margin: number
  fgColor: string
  bgColor: string
  transparentBackground: boolean
  dotStyle: DotStyle
  errorCorrection: ErrorCorrection
  logo: string | null
}

export const DEFAULT_CONFIG: QRConfig = {
  data: 'https://example.com',
  size: 320,
  margin: 16,
  fgColor: '#111827',
  bgColor: '#ffffff',
  transparentBackground: false,
  dotStyle: 'square',
  errorCorrection: 'M',
  logo: null,
}
