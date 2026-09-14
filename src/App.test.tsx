import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('qr-code-styling', () => ({
  default: class {
    append() {}
    update() {}
    async getRawData() {
      return new Blob(['qr'], { type: 'image/png' })
    }
  },
}))

afterEach(() => {
  vi.unstubAllGlobals()
  window.localStorage.clear()
})

describe('App', () => {
  it('menampilkan judul dan tombol aksi', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'QR Code Generator' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Unduh' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Opsi format unduhan' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Salin ke clipboard' })).toBeInTheDocument()
  })

  it('menampilkan opsi PNG dan SVG lewat menu unduh', async () => {
    const user = userEvent.setup()
    render(<App />)

    const trigger = screen.getByRole('button', { name: 'Opsi format unduhan' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('menuitem', { name: 'SVG' })).not.toBeInTheDocument()

    await user.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('menuitem', { name: 'PNG' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'SVG' })).toBeInTheDocument()
  })

  it('menyalin gambar ke clipboard', async () => {
    const user = userEvent.setup()
    const write = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('ClipboardItem', class {})
    vi.stubGlobal('navigator', { clipboard: { write } })
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Salin ke clipboard' }))

    expect(write).toHaveBeenCalledTimes(1)
    expect(await screen.findByText('Tersalin!')).toBeInTheDocument()
  })

  it('memperbarui nilai input teks', async () => {
    const user = userEvent.setup()
    render(<App />)

    const textarea = screen.getByRole('textbox', { name: 'Teks atau URL' })
    await user.clear(textarea)
    await user.type(textarea, 'halo')

    expect(textarea).toHaveValue('halo')
  })

  it('menampilkan form dinamis sesuai tipe konten', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'WhatsApp' }))

    expect(screen.getByLabelText(/Nomor WhatsApp/)).toBeInTheDocument()
    expect(screen.getByLabelText('Pesan awal (opsional)')).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: 'Teks atau URL' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'WiFi' }))
    expect(screen.getByLabelText('Nama jaringan (SSID)')).toBeInTheDocument()
    expect(screen.getByLabelText('Keamanan')).toBeInTheDocument()

    expect(screen.getByRole('button', { name: 'WhatsApp' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByRole('button', { name: 'WiFi' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('memilih bentuk titik lewat tombol sampel', async () => {
    const user = userEvent.setup()
    render(<App />)

    const toggle = screen.getByRole('button', { name: /Pengaturan kustomisasi/ })
    await user.click(toggle)

    const option = screen.getByRole('button', { name: 'Titik' })
    expect(option).toHaveAttribute('aria-pressed', 'false')

    await user.click(option)

    expect(option).toHaveAttribute('aria-pressed', 'true')
  })

  it('beralih ke tab massal dan menyembunyikan tombol salin', async () => {
    const user = userEvent.setup()
    render(<App />)

    const bulkTab = screen.getByRole('tab', { name: 'Massal' })
    expect(bulkTab).toHaveAttribute('aria-selected', 'false')

    await user.click(bulkTab)

    expect(bulkTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Tunggal' })).toHaveAttribute('aria-selected', 'false')
    expect(screen.getByLabelText('File teks/URL (satu per baris)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Unduh ZIP' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Salin ke clipboard' })).not.toBeInTheDocument()
  })

  it('menghitung entri setelah memilih file di tab massal', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('tab', { name: 'Massal' }))

    const input = screen.getByLabelText('File teks/URL (satu per baris)') as HTMLInputElement
    const file = new File(['https://a.com\nhalo\n'], 'daftar.txt', { type: 'text/plain' })
    await user.upload(input, file)

    expect(await screen.findByText('daftar.txt — 2 entri')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Unduh ZIP' })).not.toBeDisabled()
  })

  it('menolak file di tab massal yang melebihi batas entri', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('tab', { name: 'Massal' }))

    const input = screen.getByLabelText('File teks/URL (satu per baris)') as HTMLInputElement
    const lines = Array.from({ length: 1001 }, (_, i) => `https://a.com/${i}`)
    const file = new File([lines.join('\n')], 'banyak.txt', { type: 'text/plain' })
    await user.upload(input, file)

    expect(
      await screen.findByText('Maksimal 1000 entri per file (file ini 1001).'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/banyak.txt —/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Unduh ZIP' })).toBeDisabled()
  })

  it('memproses entri yang ditempel di tab massal', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('tab', { name: 'Massal' }))
    await user.click(screen.getByRole('tab', { name: 'Tempel' }))

    const textarea = screen.getByLabelText('Tempel teks/URL (satu per baris)')
    fireEvent.change(textarea, { target: { value: 'https://a.com\nhttps://b.com' } })

    expect(await screen.findByText('2 entri')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Unduh ZIP' })).not.toBeDisabled()
  })

  it('menolak tempelan yang melebihi batas entri', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('tab', { name: 'Massal' }))
    await user.click(screen.getByRole('tab', { name: 'Tempel' }))

    const lines = Array.from({ length: 1001 }, (_, i) => `https://a.com/${i}`)
    const textarea = screen.getByLabelText('Tempel teks/URL (satu per baris)')
    fireEvent.change(textarea, { target: { value: lines.join('\n') } })

    expect(
      await screen.findByText('Maksimal 1000 entri per file (file ini 1001).'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Unduh ZIP' })).toBeDisabled()
  })
})
