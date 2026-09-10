import { beforeEach, describe, expect, it } from 'vitest'
import { loadConfig, parseConfig, saveConfig } from './storage'
import { DEFAULT_CONFIG } from '../types'

describe('parseConfig', () => {
  it('mengembalikan default untuk nilai kosong', () => {
    expect(parseConfig(null)).toEqual(DEFAULT_CONFIG)
  })

  it('mengembalikan default untuk JSON rusak', () => {
    expect(parseConfig('{bukan json')).toEqual(DEFAULT_CONFIG)
  })

  it('mengabaikan nilai yang tidak valid', () => {
    const config = parseConfig(
      JSON.stringify({
        data: 'halo',
        size: 99999,
        margin: -10,
        fgColor: 'merah',
        bgColor: '#ABCDEF',
        transparentBackground: 'ya',
        dotStyle: 'aneh',
        errorCorrection: 'Z',
        logo: 'https://contoh.com/logo.png',
      }),
    )

    expect(config.data).toBe('halo')
    expect(config.size).toBe(1024)
    expect(config.margin).toBe(0)
    expect(config.fgColor).toBe(DEFAULT_CONFIG.fgColor)
    expect(config.bgColor).toBe('#ABCDEF')
    expect(config.transparentBackground).toBe(DEFAULT_CONFIG.transparentBackground)
    expect(config.dotStyle).toBe(DEFAULT_CONFIG.dotStyle)
    expect(config.errorCorrection).toBe(DEFAULT_CONFIG.errorCorrection)
    expect(config.logo).toBeNull()
  })

  it('menerima logo berupa data URL', () => {
    const logo = 'data:image/png;base64,abc'
    expect(parseConfig(JSON.stringify({ logo })).logo).toBe(logo)
  })
})

describe('loadConfig dan saveConfig', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('menyimpan lalu memuat kembali konfigurasi', () => {
    const config = { ...DEFAULT_CONFIG, data: 'https://contoh.com', size: 512 }
    saveConfig(config)
    expect(loadConfig()).toEqual(config)
  })

  it('mengembalikan default bila belum ada data', () => {
    expect(loadConfig()).toEqual(DEFAULT_CONFIG)
  })
})
