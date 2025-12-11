# 🚀 Panduan Go-Live: Vercel Fullstack + Neon Database

Solusi Deployment **100% GRATIS** tanpa Kartu Kredit!

## Phase 1: Siapkan Database (Neon.tech)

1.  Buka **[https://console.neon.tech/signup](https://console.neon.tech/signup)**
2.  **Sign up** dengan GitHub / Google.
3.  Buat Project baru:
    *   Name: `duck-farm-db`
    *   Region: Singapore (atau terdekat)
    *   Klik **Create Project**.
4.  ⚠️ **COPY Connection String** (Contoh: `postgres://user:pass@ep-xyz.aws.neon.tech/neondb...`)
    *   *Simpan URL ini untuk langkah selanjutnya.*

---

## Phase 2: Push Kode Baru ke GitHub

Karena ada perubahan konfigurasi (kita pindah dari Render ke Vercel Fullstack), Anda wajib push kode terbaru dulu.

Buka terminal dan jalankan:

```bash
git add .
git commit -m "Migrate backend to Vercel Serverless"
git push
```

---

## Phase 3: Deploy Fullstack ke Vercel

1.  Buka **[https://vercel.com/new](https://vercel.com/new)**
2.  Import repository `dashboard-peternakan-bebek`.
3.  Di halaman **Configure Project**:
    *   **Framework Preset**: Vite (Auto-detected).
    *   **Root Directory**: Biarkan default (`./`).
    *   **Environment Variables** (Klik tombol panah untuk expand):
        *   Masukkan variable berikut **Satu per Satu**:
            1.  `DATABASE_URL` = **Paste URL dari Neon tadi**
            2.  `VITE_API_URL` = `/api`  *(Simpel kan? Cukup isi `/api` saja karena frontend & backend di satu domain)*
4.  Klik **Deploy**.

---

## 🎉 Selesai!

Tunggu proses build selesai (sekitar 1-2 menit).
Jika sukses, aplikasi Anda akan live di URL `https://dashboard-peternakan-bebek.vercel.app`.

### Catatan Penting
Databasenya masih kosong. Anda bisa mulai input data batch baru lewat Dashboard yang sudah live!
