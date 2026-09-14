import type { EmailContent, QRConfig, WhatsappContent, WifiContent } from '../types'

const escWifi = (value: string): string => value.replace(/([\\;,:"])/g, '\\$1')

export function wifiPayload({ ssid, password, security, hidden }: WifiContent): string {
  const withPassword = security !== 'nopass'
  const fields = [
    `T:${security}`,
    `S:${escWifi(ssid)}`,
    ...(withPassword ? [`P:${escWifi(password)}`] : []),
    ...(hidden ? ['H:true'] : []),
  ]
  return `WIFI:${fields.join(';')};;`
}

export function whatsappPayload({ number, message }: WhatsappContent): string {
  const clean = number.replace(/[\s-]+/g, '')
  const query = message.trim() ? `?text=${encodeURIComponent(message.trim())}` : ''
  return `https://wa.me/${clean}${query}`
}

export function emailPayload({ to, subject, body }: EmailContent): string {
  const params = new URLSearchParams()
  if (subject.trim()) params.set('subject', subject.trim())
  if (body.trim()) params.set('body', body.trim())
  const query = params.toString()
  return `mailto:${to}${query ? `?${query}` : ''}`
}

export function buildPayload(config: QRConfig): string {
  switch (config.contentType) {
    case 'wifi':
      return wifiPayload(config.wifi)
    case 'whatsapp':
      return whatsappPayload(config.whatsapp)
    case 'email':
      return emailPayload(config.email)
    default:
      return config.data
  }
}
