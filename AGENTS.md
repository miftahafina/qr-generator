# AGENTS.md

Panduan untuk AI agent dan kolaborator yang bekerja di repo ini. Baca ini dulu sebelum
mengubah kode.

## Tentang project

Generator QR code statis yang berjalan 100% di browser. Lihat `plan.md` untuk scope dan
roadmap. Prinsip utama: **tanpa backend, tanpa tracking, tanpa request eksternal saat
runtime**.

## Perintah

```bash
npm install        # pasang dependency
npm run dev        # dev server (Vite)
npm run build      # build produksi ke dist/
npm run preview    # preview hasil build
npm run lint       # ESLint
npm run format     # Prettier (tulis ulang file)
npm run typecheck  # tsc --noEmit
npm run test       # Vitest (sekali jalan)
```

Deploy (Cloudflare Pages):

```bash
npm run build
npx wrangler pages deploy dist --project-name qr-generator
```

## Aturan kode

- **TypeScript strict** — jangan pakai `any`; kalau terpaksa, jelaskan alasannya.
- **Tanpa komentar** di kode kecuali diminta secara eksplisit.
- Ikuti gaya dan pola file di sekitarnya sebelum membuat file baru.
- Komponen React: function component + hooks. Hindari class component.
- Styling dengan kelas Tailwind; hindari CSS inline kecuali nilai dinamis.
- **Warna brand**: pakai token `primary`/`primary-hover`/`primary-light` dari
  `src/index.css`; jangan hardcode warna brand di komponen.
- **Kursor**: `cursor: pointer` untuk kontrol interaktif sudah diatur global di
  `src/index.css`; jangan menambah `cursor-pointer` per komponen.
- Jangan menambah dependency baru tanpa alasan kuat; cek dulu apakah sudah ada yang cocok.

## Aturan privasi (tidak bisa dinegosiasikan)

- Jangan menambahkan analytics, iklan, cookie pihak ketiga, atau remote font/script.
- Jangan mengirim data QR atau isi input ke server mana pun.
- Semua pemrosesan gambar/QR dilakukan di client.
- Fitur clipboard hanya **menulis** gambar ke clipboard lokal; jangan membaca clipboard.
- Pertahankan `public/_headers` (CSP, Referrer-Policy, Permissions-Policy).

## Verifikasi sebelum selesai

Setiap perubahan harus lulus:

```bash
npm run typecheck && npm run lint && npm run test && npm run build
```

Untuk perubahan UI, uji juga secara manual:

- QR hasil unduhan (PNG & SVG) bisa di-scan.
- Tombol "Salin ke clipboard" menghasilkan PNG yang bisa di-paste dan tetap ter-scan.
- DevTools Network tidak menunjukkan request eksternal setelah load.
- Logo + error correction `H` tetap ter-scan.

## Alur kerja

- **Conventional Commits**: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- Branch fitur: `feat/<nama-singkat>`.
- Commit kecil dan fokus; jangan campur refactor besar dengan fitur.
- Perbarui `plan.md` (bagian Status) saat milestone selesai.
- Jangan pernah commit secret. Gunakan `.env.example` sebagai template.

## Definition of Done

- Fitur berjalan sesuai acceptance criteria di `plan.md`.
- `typecheck`, `lint`, `test`, `build` hijau.
- Tidak melanggar aturan privasi.
- `plan.md` diperbarui bila scope berubah.
