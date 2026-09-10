# Security Policy

## Melaporkan kerentanan

Jangan membuka issue publik untuk masalah keamanan. Laporkan secara privat melalui
[GitHub Security Advisories](https://github.com/miftahafina/qr-generator/security/advisories/new).

Sertakan bila memungkinkan:

- Deskripsi masalah dan dampaknya
- Langkah reproduksi
- Browser/versi yang terdampak
- Saran perbaikan (opsional)

Kami akan menindaklanjuti secara _best-effort_ dan mengkredit pelapor bila diinginkan.

## Scope

Project ini adalah aplikasi statis yang berjalan 100% di browser: tanpa backend, tanpa
database, dan tanpa request jaringan saat runtime. Area yang relevan antara lain:

- Eksekusi kode tak terduga dari input (teks/URL/logo) atau SVG yang dihasilkan.
- Kebocoran data keluar dari perangkat (mis. request eksternal, clipboard dibaca).
- Melemahnya security header di `public/_headers` (CSP, Referrer-Policy,
  Permissions-Policy).

Kelemahan pada dependency pihak ketiga sebaiknya juga dilaporkan ke upstream terkait.
