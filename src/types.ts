import type { DotType, ErrorCorrectionLevel } from 'qr-code-styling'
import type { ExportFormat } from './lib/qr'

export type DotStyle = DotType
export type ErrorCorrection = ErrorCorrectionLevel

export type BusyAction = ExportFormat | 'copy'

export type ContentType = 'text' | 'wifi' | 'whatsapp' | 'email'
export type WifiSecurity = 'nopass' | 'WPA' | 'WEP'

export interface WifiContent {
  ssid: string
  password: string
  security: WifiSecurity
  hidden: boolean
}

export interface WhatsappContent {
  number: string
  message: string
}

export interface EmailContent {
  to: string
  subject: string
  body: string
}

export interface QRConfig {
  contentType: ContentType
  data: string
  wifi: WifiContent
  whatsapp: WhatsappContent
  email: EmailContent
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
  contentType: 'text',
  data: '',
  wifi: { ssid: '', password: '', security: 'WPA', hidden: false },
  whatsapp: { number: '', message: '' },
  email: { to: '', subject: '', body: '' },
  size: 320,
  margin: 16,
  fgColor: '#111827',
  bgColor: '#ffffff',
  transparentBackground: false,
  dotStyle: 'square',
  errorCorrection: 'M',
  logo: null,
}
