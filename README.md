# QR Code Generator

Generator QR code yang berjalan **100% di browser**. Tanpa backend, tanpa tracking,
tanpa iklan. Semua pemrosesan terjadi lokal di perangkat kamu.

## Fitur

- Generate QR dari teks atau URL dengan preview realtime
- Unduh PNG sekali klik, atau pilih format PNG/SVG lewat menu di tombol Unduh
- Salin QR ke clipboard sebagai PNG (butuh secure context / HTTPS)
- Kustomisasi ukuran, warna, margin, level koreksi error, dan bentuk titik
- Latar transparan (PNG & SVG)
- Upload logo di tengah QR
- Teks/URL dan semua opsi otomatis tersimpan di browser (localStorage)
- Dark mode

## Development

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

## Perintah

```bash
npm run dev        # dev server
npm run build      # build produksi ke dist/
npm run preview    # preview hasil build
npm run lint       # ESLint
npm run format     # Prettier
npm run typecheck  # tsc --noEmit
npm run test       # Vitest
```

## Deploy

Project ini adalah static site dan cocok untuk Cloudflare Pages.

```bash
npm run build
npx wrangler pages deploy dist --project-name qr-generator
```

Atau hubungkan repo ke Cloudflare Pages dengan build command `npm run build` dan output
directory `dist`.

## Privasi

- Semua QR dibuat di client; tidak ada data yang dikirim ke server.
- Tidak ada analytics, iklan, atau cookie pihak ketiga.
- Security header diatur di `public/_headers`.

## Lisensi

MIT
