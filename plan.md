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

- [x] Generate QR dari teks atau URL dengan preview realtime
- [x] Unduh sebagai PNG dan SVG
- [x] Salin QR ke clipboard (PNG)
- [x] Kustomisasi: ukuran, warna foreground/background, margin, level koreksi error, bentuk titik
- [x] Latar transparan (PNG & SVG)
- [x] Upload logo di tengah QR (error correction otomatis ke `H`)
- [x] Simpan teks/URL dan semua opsi ke localStorage (auto-restore saat reload)
- [x] Dark mode (tersimpan di localStorage)

## Non-goals (untuk sekarang)

- Akun / login
- Riwayat QR di server
- QR dinamis (redirect) atau pelacakan scan
- Analytics / iklan

## Stack

| Bagian      | Pilihan                     |
| ----------- | --------------------------- |
| Build       | Vite                        |
| UI          | React + TypeScript (strict) |
| Styling     | Tailwind CSS                |
| QR engine   | `qr-code-styling`           |
| Test        | Vitest                      |
| Lint/format | ESLint + Prettier           |
| CI          | GitHub Actions              |
| Hosting     | Cloudflare Pages            |

## Roadmap

1. Inisiasi git + `.gitignore`
2. Dokumen: `plan.md`, `AGENTS.md`, `README.md`
3. Scaffold Vite + React + TS, Tailwind, `qr-code-styling`
4. Tooling: ESLint, Prettier, Vitest, CI
5. QR generation + live preview
6. Kustomisasi + logo + download PNG/SVG
7. Salin QR ke clipboard
8. Dark mode
9. Privacy headers + deploy config Cloudflare Pages
10. Verifikasi build/lint/typecheck/test

## Status

- [x] Inisiasi git + `.gitignore`
- [x] Dokumen: `plan.md`, `AGENTS.md`, `README.md`
- [x] Scaffold Vite + React + TS, Tailwind, `qr-code-styling`
- [x] Tooling: ESLint, Prettier, Vitest, CI
- [x] QR generation + live preview
- [x] Kustomisasi + logo + download PNG/SVG
- [x] Salin QR ke clipboard
- [x] Dark mode
- [x] Privacy headers + deploy config Cloudflare Pages
- [x] Verifikasi build/lint/typecheck/test

## Keputusan

- **Warna/bentuk**: warna solid + bentuk titik (tanpa gradient).
- **Bahasa UI**: Indonesia.
- **Domain**: `*.pages.dev` dulu; domain sendiri menyusul bila perlu.
- **Logo**: menambahkan logo otomatis menaikkan koreksi error ke `H`.
- **Clipboard**: salin gambar hanya sebagai PNG (`image/png`); browser tanpa dukungan
  Clipboard API menampilkan pesan error.
- **Privasi**: `imageOptions.saveAsBlob` dimatikan agar tidak ada XHR internal;
  CSP `connect-src 'none'`.

## Langkah deploy (Cloudflare Pages)

1. Push repo ke GitHub.
2. Buat project Pages, hubungkan repo.
3. Build command: `npm run build`, output directory: `dist`.
4. Atau manual: `npx wrangler pages deploy dist --project-name qr-generator`.
