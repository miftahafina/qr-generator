import type { ChangeEvent } from 'react'
import type {
  ContentType,
  EmailContent,
  QRConfig,
  WhatsappContent,
  WifiContent,
  WifiSecurity,
} from '../types'

interface Props {
  config: QRConfig
  onChange: (patch: Partial<QRConfig>) => void
}

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: 'text', label: 'Teks atau URL' },
  { value: 'wifi', label: 'WiFi' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
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

  const onContentType = (event: ChangeEvent<HTMLSelectElement>) => {
    onChange({ contentType: event.target.value as ContentType })
  }

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <label htmlFor="qr-content-type" className={labelClass}>
          Tipe konten
        </label>
        <select
          id="qr-content-type"
          value={config.contentType}
          onChange={onContentType}
          className={inputClass}
        >
          {CONTENT_TYPES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
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
