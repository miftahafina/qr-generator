import type { ReactNode } from 'react'
import type {
  ContentType,
  EmailContent,
  QRConfig,
  WhatsappContent,
  WifiContent,
  WifiSecurity,
} from '../types'
import { ContentTypeOption } from './ContentTypeOption'

interface Props {
  config: QRConfig
  onChange: (patch: Partial<QRConfig>) => void
}

const CONTENT_TYPES: { value: ContentType; label: string; icon: ReactNode }[] = [
  {
    value: 'text',
    label: 'Teks atau URL',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="M6 8h.01M10 8h.01M14 8h.01M6 12h.01M10 12h.01M14 12h.01M6 16h.01M10 16h.01M14 16h.01" />
      </svg>
    ),
  },
  {
    value: 'wifi',
    label: 'WiFi',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <circle cx="12" cy="20" r="1" />
      </svg>
    ),
  },
  {
    value: 'whatsapp',
    label: 'WhatsApp',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  },
  {
    value: 'email',
    label: 'Email',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
  },
]

const WIFI_SECURITIES: { value: WifiSecurity; label: string }[] = [
  { value: 'WPA', label: 'WPA/WPA2' },
  { value: 'WEP', label: 'WEP' },
  { value: 'nopass', label: 'Tanpa sandi' },
]

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-primary-light dark:focus:ring-primary/40'

const labelClass = 'text-sm font-medium text-slate-700 dark:text-slate-200'

export function ContentInput({ config, onChange }: Props) {
  const updateWifi = (patch: Partial<WifiContent>) =>
    onChange({ wifi: { ...config.wifi, ...patch } })
  const updateWhatsapp = (patch: Partial<WhatsappContent>) =>
    onChange({ whatsapp: { ...config.whatsapp, ...patch } })
  const updateEmail = (patch: Partial<EmailContent>) =>
    onChange({ email: { ...config.email, ...patch } })

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <span className={labelClass}>Tipe konten</span>
        <div
          role="group"
          aria-label="Tipe konten"
          className="grid grid-cols-2 gap-2 sm:grid-cols-4"
        >
          {CONTENT_TYPES.map((item) => (
            <ContentTypeOption
              key={item.value}
              label={item.label}
              icon={item.icon}
              selected={config.contentType === item.value}
              onSelect={() => onChange({ contentType: item.value })}
            />
          ))}
        </div>
      </div>

      {config.contentType === 'text' && (
        <>
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
        </>
      )}

      {config.contentType === 'wifi' && (
        <div className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
          <div className="space-y-2">
            <label htmlFor="wifi-ssid" className={labelClass}>
              Nama jaringan (SSID)
            </label>
            <input
              id="wifi-ssid"
              type="text"
              value={config.wifi.ssid}
              onChange={(event) => updateWifi({ ssid: event.target.value })}
              placeholder="NamaWiFi"
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="wifi-security" className={labelClass}>
              Keamanan
            </label>
            <select
              id="wifi-security"
              value={config.wifi.security}
              onChange={(event) => updateWifi({ security: event.target.value as WifiSecurity })}
              className={inputClass}
            >
              {WIFI_SECURITIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="wifi-password" className={labelClass}>
              Sandi
            </label>
            <input
              id="wifi-password"
              type="text"
              value={config.wifi.password}
              disabled={config.wifi.security === 'nopass'}
              onChange={(event) => updateWifi({ password: event.target.value })}
              placeholder="sandiWifi"
              className={inputClass}
            />
          </div>
          <label
            htmlFor="wifi-hidden"
            className="flex items-center gap-2 border-t border-slate-200 pt-3 dark:border-slate-800"
          >
            <input
              id="wifi-hidden"
              type="checkbox"
              checked={config.wifi.hidden}
              onChange={(event) => updateWifi({ hidden: event.target.checked })}
              className="h-4 w-4 accent-primary"
            />
            <span className={labelClass}>Jaringan tersembunyi</span>
          </label>
        </div>
      )}

      {config.contentType === 'whatsapp' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <label htmlFor="wa-number" className={labelClass}>
              Nomor WhatsApp (dengan kode negara, tanpa 0/+)
            </label>
            <input
              id="wa-number"
              type="tel"
              value={config.whatsapp.number}
              onChange={(event) => updateWhatsapp({ number: event.target.value })}
              placeholder="6281234567890"
              className={`${inputClass} font-mono`}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="wa-message" className={labelClass}>
              Pesan awal (opsional)
            </label>
            <textarea
              id="wa-message"
              value={config.whatsapp.message}
              onChange={(event) => updateWhatsapp({ message: event.target.value })}
              rows={2}
              spellCheck={false}
              placeholder="Halo, saya dari…"
              className={`${inputClass} resize-y`}
            />
          </div>
        </div>
      )}

      {config.contentType === 'email' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <label htmlFor="email-to" className={labelClass}>
              Alamat tujuan
            </label>
            <input
              id="email-to"
              type="email"
              value={config.email.to}
              onChange={(event) => updateEmail({ to: event.target.value })}
              placeholder="nama@contoh.com"
              className={`${inputClass} font-mono`}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email-subject" className={labelClass}>
              Subjek (opsional)
            </label>
            <input
              id="email-subject"
              type="text"
              value={config.email.subject}
              onChange={(event) => updateEmail({ subject: event.target.value })}
              placeholder="Subjek email"
              className={inputClass}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email-body" className={labelClass}>
              Isi email (opsional)
            </label>
            <textarea
              id="email-body"
              value={config.email.body}
              onChange={(event) => updateEmail({ body: event.target.value })}
              rows={3}
              spellCheck={false}
              placeholder="Isi pesan…"
              className={`${inputClass} resize-y`}
            />
          </div>
        </div>
      )}
    </div>
  )
}
