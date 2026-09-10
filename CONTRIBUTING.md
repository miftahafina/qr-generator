# Contributing

Terima kasih sudah tertarik berkontribusi! Panduan teknis lengkap ada di
[AGENTS.md](AGENTS.md); dokumen ini merangkum alur kerja untuk kontributor manusia.

## Prasyarat

- Node.js sesuai [.nvmrc](.nvmrc)
- npm

## Setup

```bash
npm install
npm run dev
```

## Sebelum mengirim PR

Pastikan semua perintah ini hijau:

```bash
npm run typecheck && npm run lint && npm run test && npm run build && npm run format:check
```

Untuk perubahan UI, uji manual:

- QR hasil unduhan (PNG & SVG) bisa di-scan.
- Tombol "Salin ke clipboard" menghasilkan PNG yang bisa di-paste dan tetap ter-scan.
- DevTools Network tidak menunjukkan request eksternal setelah load.
- Logo + error correction `H` tetap ter-scan.

## Alur kerja

- Buat branch fitur: `feat/<nama-singkat>`.
- Gunakan **Conventional Commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- Commit kecil dan fokus; jangan campur refactor besar dengan fitur.
- Perbarui `plan.md` (bagian Status) bila milestone/scope berubah.

## Batasan yang tidak bisa dinegosiasikan

Project ini menganut **privasi dulu**. PR yang melanggar hal berikut tidak akan diterima:

- Menambahkan analytics, iklan, cookie pihak ketiga, atau remote font/script.
- Mengirim data QR atau isi input ke server mana pun.
- Memproses gambar/QR di luar client.
- Membaca clipboard (fitur clipboard hanya **menulis**).
- Mengubah `public/_headers` (CSP, Referrer-Policy, Permissions-Policy) ke arah yang
  lebih longgar tanpa diskusi.

## Review

Maintenance bersifat _best-effort_. Jangan menambahkan dependency baru tanpa alasan kuat;
cek dulu apakah yang sudah ada bisa dipakai.
