import { render, screen } from '@testing-library/react'
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

    const textarea = screen.getByLabelText('Teks atau URL')
    await user.clear(textarea)
    await user.type(textarea, 'halo')

    expect(textarea).toHaveValue('halo')
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
})
