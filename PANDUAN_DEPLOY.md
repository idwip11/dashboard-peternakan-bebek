# 🚀 Panduan Go-Live: GitHub & Deployment

Tahap persiapan file sudah selesai! Sekarang saatnya upload ke GitHub dan deploy ke internet.

## Phase 4: Push ke GitHub

Silakan ikuti langkah-langkah ini di terminal:

1. **Stop semua server** dulu (Ctrl+C di terminal yang sedang running)
2. **Masuk ke folder project**:
   ```bash
   cd "/Users/mac/Desktop/01. FOLDER IMAM/dashboard bebek/dashboard-bebek-app"
   ```
3. **Initialize Git & Push**:
   ```bash
   # Init Git
   git init
   
   # Add all files
   git add .
   
   # Commit pertama
   git commit -m "Initial commit: Duck Farm Dashboard Fullstack"
   
   # Rename branch ke main
   git branch -M main
   
   # Connect ke Remote Repository (Ganti URL dengan repository Anda)
   # Buat repository baru dulu di github.com (kosongan, tanpa README/gitignore)
   git remote add origin https://github.com/idwip11/dashboard-peternakan-bebek.git
   
   # Push code
   git push -u origin main
   ```

---

## Phase 5 & 6: Deploy Backend & Database (Render)

1. Buka [dashboard.render.com](https://dashboard.render.com)
2. Klik **New +** → **PostgreSQL**
   - Name: `duck-farm-db`
   - Region: Singapore (biar dekat)
   - Plan: **Free**
   - Click **Create Database**
   - ⚠️ **COPY "Internal Connection URL"** (untuk Step 3) dan **"External Connection URL"** (untuk testing lokal nanti)

3. Klik **New +** → **Web Service**
   - Connect ke GitHub repo `dashboard-peternakan-bebek`
   - **Root Directory**: `backend` (PENTING!)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `DATABASE_URL`: Paste "Internal Connection URL" dari step 2
     - `NODE_ENV`: `production`
     - `FRONTEND_URL`: `https://dashboard-bebek.vercel.app` (nanti disesuaikan)
   - Plan: **Free**

4. Tunggu deploy selesai! Backend Anda akan live di URL `.onrender.com`.

---

## Phase 7: Deploy Frontend (Vercel)

1. Buka [vercel.com/new](https://vercel.com/new)
2. Import repository `dashboard-peternakan-bebek`
3. **Configure Project**:
   - **Root Directory**: Klik "Edit" dan pilih folder root (biarkan default `.`)
   - **Build & Development Settings**:
     - Framework Preset: Vite (biasanya auto detect)
   - **Environment Variables**:
     - `VITE_API_URL`: Paste URL backend Render Anda (contoh: `https://xxxx.onrender.com/api`)
4. Klik **Deploy**!

---

## 🎉 Selesai!

Sekarang aplikasi Anda sudah online!
- Database: Render PostgreSQL
- Backend: Render Web Service
- Frontend: Vercel

**Note:** Saat awal deploy backend di Render, mungkin perlu menunggu 5-10 menit. Jika backend "tidur" (sleep), akses pertama kali akan loading sekitar 30 detik.
