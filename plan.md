# QR Code Generator — Plan

## Ringkasan

Generator QR code yang berjalan **100% di browser** (client-side). Tanpa backend,
tanpa analytics, tanpa iklan, tanpa tracking, dan tanpa request eksternal saat runtime.
Dibangun dengan Vite + React + TypeScript dan di-deploy sebagai static site ke
Cloudflare Pages.

## Prinsip

- **Privasi dulu** — semua pembuatan QR terjadi lokal di browser. Tidak ada data yang
  dikirim ke server mana pun.
- **Zero tracking** — tidak ada analytics, iklan, cookie pihak ketiga, atau remote font.
- **Sederhana & cepat** — satu halaman, bundle kecil, tanpa akun/login.
- **Gratis** — tidak ada monetisasi untuk versi ini.

## Fitur MVP

- [ ] Generate QR dari teks atau URL dengan preview realtime
- [ ] Unduh sebagai PNG dan SVG
- [ ] Kustomisasi: ukuran, warna foreground/background, margin, level koreksi error, bentuk titik
- [ ] Upload logo di tengah QR (error correction otomatis ke `H`)
- [ ] Dark mode (tersimpan di localStorage)

## Non-goals (untuk sekarang)

- Akun / login
- Riwayat QR di server
- QR dinamis (redirect) atau pelacakan scan
- Analytics / iklan

## Stack

| Bagian      | Pilihan                          |
| ----------- | -------------------------------- |
| Build       | Vite                             |
| UI          | React + TypeScript (strict)      |
| Styling     | Tailwind CSS                     |
| QR engine   | `qr-code-styling`                |
| Test        | Vitest                           |
| Lint/format | ESLint + Prettier                |
| CI          | GitHub Actions                   |
| Hosting     | Cloudflare Pages                 |

## Roadmap

1. Inisiasi git + `.gitignore`
2. Dokumen: `plan.md`, `AGENTS.md`, `README.md`
3. Scaffold Vite + React + TS, Tailwind, `qr-code-styling`
4. Tooling: ESLint, Prettier, Vitest, CI
5. QR generation + live preview
6. Kustomisasi + logo + download PNG/SVG
7. Dark mode
8. Privacy headers + deploy config Cloudflare Pages
9. Verifikasi build/lint/typecheck/test

## Status

- [x] Inisiasi git + `.gitignore`
- [x] Dokumen: `plan.md`, `AGENTS.md`, `README.md`
- [ ] Scaffold Vite + React + TS, Tailwind, `qr-code-styling`
- [ ] Tooling: ESLint, Prettier, Vitest, CI
- [ ] QR generation + live preview
- [ ] Kustomisasi + logo + download PNG/SVG
- [ ] Dark mode
- [ ] Privacy headers + deploy config Cloudflare Pages
- [ ] Verifikasi build/lint/typecheck/test

## Keputusan terbuka

- Warna/bentuk: solid + bentuk titik dasar, atau termasuk gradient/preset gaya?
- Bahasa UI: Indonesia, Inggris, atau dua-duanya?
- Domain: `*.pages.dev` dulu atau domain sendiri?
