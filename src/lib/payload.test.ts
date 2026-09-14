import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG } from '../types'
import { buildPayload, emailPayload, whatsappPayload, wifiPayload } from './payload'

describe('wifiPayload', () => {
  it('menghasilkan string WIFI dengan sandi', () => {
    expect(
      wifiPayload({ ssid: 'NetKantor', password: 'rahasia', security: 'WPA', hidden: false }),
    ).toBe('WIFI:T:WPA;S:NetKantor;P:rahasia;;')
  })

  it('menambahkan H:true untuk jaringan tersembunyi', () => {
    expect(wifiPayload({ ssid: 'Net', password: 'rahasia', security: 'WPA', hidden: true })).toBe(
      'WIFI:T:WPA;S:Net;P:rahasia;H:true;;',
    )
  })

  it('menghasilkan tanpa sandi untuk keamanan nopass', () => {
    expect(wifiPayload({ ssid: 'Bebas', password: '', security: 'nopass', hidden: false })).toBe(
      'WIFI:T:nopass;S:Bebas;;',
    )
  })

  it('meng-escape karakter khusus di SSID dan sandi', () => {
    expect(wifiPayload({ ssid: 'Satu;Dua', password: 'a"b', security: 'WEP', hidden: false })).toBe(
      'WIFI:T:WEP;S:Satu\\;Dua;P:a\\"b;;',
    )
  })
})

describe('whatsappPayload', () => {
  it('menghasilkan tautan wa.me tanpa pesan', () => {
    expect(whatsappPayload({ number: '62812 3456-789', message: '' })).toBe(
      'https://wa.me/628123456789',
    )
  })

  it('menambahkan pesan yang di-encode', () => {
    expect(whatsappPayload({ number: '628123456789', message: 'Halo, Pak!' })).toBe(
      'https://wa.me/628123456789?text=Halo%2C%20Pak!',
    )
  })
})

describe('emailPayload', () => {
  it('menghasilkan mailto tanpa opsi', () => {
    expect(emailPayload({ to: 'a@b.com', subject: '', body: '' })).toBe('mailto:a@b.com')
  })

  it('menambahkan subjek dan isi', () => {
    expect(emailPayload({ to: 'a@b.com', subject: 'Halo dunia', body: 'Isi pesan' })).toBe(
      'mailto:a@b.com?subject=Halo+dunia&body=Isi+pesan',
    )
  })
})

describe('buildPayload', () => {
  it('memakai data untuk tipe teks', () => {
    expect(buildPayload({ ...DEFAULT_CONFIG, data: 'halo' })).toBe('halo')
  })

  it('memakai field terstruktur untuk tipe lain', () => {
    const config = {
      ...DEFAULT_CONFIG,
      contentType: 'wifi' as const,
      wifi: { ssid: 'Net', password: 'pw', security: 'WPA' as const, hidden: false },
    }
    expect(buildPayload(config)).toBe('WIFI:T:WPA;S:Net;P:pw;;')
  })
})
