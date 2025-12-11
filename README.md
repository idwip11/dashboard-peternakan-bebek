# 🦆 Dashboard Peternakan Bebek

Dashboard web interaktif untuk manajemen dan analisis peternakan bebek dengan fitur tracking produksi, KPI analytics, dan WhatsApp notifications.

## 🚀 Quick Start

### Prerequisites
- ✅ **XAMPP** terinstall (untuk MySQL)
- ✅ **Node.js** v18+ terinstall
- ✅ **Browser** modern (Chrome, Firefox, Safari, Edge)

### Instalasi & Menjalankan

#### Cara 1: Menggunakan Script Otomatis (Recommended)

1. **Start MySQL di XAMPP**
   - Buka XAMPP Control Panel
   - Klik "Start" pada module MySQL

2. **Jalankan Development Script**
   ```bash
   cd "/Users/mac/Desktop/01. FOLDER IMAM/dashboard bebek/dashboard-bebek-app"
   ./start-dev.sh
   ```

Script ini akan otomatis:
- ✅ Cek koneksi MySQL
- ✅ Buat database jika belum ada
- ✅ Install dependencies
- ✅ Sync database schema
- ✅ Start backend server (port 3001)
- ✅ Start frontend server (port 5174)

3. **Akses Dashboard**
   
   Buka browser dan akses: **http://localhost:5174**

---

#### Cara 2: Manual Setup

Jika ingin menjalankan secara manual:

**Terminal 1 - Backend:**
```bash
cd "/Users/mac/Desktop/01. FOLDER IMAM/dashboard bebek/dashboard-bebek-app/backend"
npm install
npx prisma db push
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd "/Users/mac/Desktop/01. FOLDER IMAM/dashboard bebek/dashboard-bebek-app"
npm install
npm run dev
```

---

## 📖 Panduan Lengkap

Jika mengalami error atau masalah, lihat panduan troubleshooting lengkap di:
- [Panduan Error & Troubleshooting](/.gemini/antigravity/brain/9e326e6d-4357-47c6-a116-839927ae3f77/panduan_error.md)
- [Backend Setup Guide](/backend/SETUP.md)

---

## ✨ Fitur Utama

### 📊 Dashboard Analytics
- KPI Cards: Total Populasi, Mortalitas, FCR, HDP, Biaya Produksi
- Ringkasan Keuangan: Revenue, Biaya, Profit Margin
- Grafik Tren: Mortalitas, FCR & HDP, Produksi Telur Bulanan
- Grafik Keuangan Bulanan

### 📝 Input Data Harian
- Form input lengkap untuk data produksi
- Tracking per kandang/batch
- Data mortalitas, pakan, telur, keuangan
- Catatan khusus untuk setiap record

### 📈 Analisis Performa
- Perbandingan dengan standar industri
- Benchmark untuk bebek pedaging & petelur
- Rekomendasi otomatis berdasarkan data

### 🏠 Manajemen Kandang
- Tracking multiple batch/kandang
- Monitor populasi real-time
- Status dan umur kandang
- Estimasi waktu panen

### ⚙️ Pengaturan
- Konfigurasi threshold alert
- Setup WhatsApp notifications
- Export data ke Excel/CSV

---

## 🛠 Tech Stack

**Frontend:**
- ⚛️ React 19 + Vite
- 🎨 Tailwind CSS
- 📊 Recharts
- 🎯 Lucide Icons

**Backend:**
- 🟢 Node.js + Express
- 🗄️ MySQL (via XAMPP)
- 🔷 Prisma ORM
- 🔐 CORS enabled

---

## 📂 Struktur Project

```
dashboard-bebek-app/
├── backend/              # Backend API (Express + Prisma)
│   ├── src/
│   │   ├── server.js    # Entry point
│   │   ├── config/      # Database config
│   │   ├── controllers/ # API controllers
│   │   └── routes/      # API routes
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── src/                  # Frontend React
│   ├── DuckFarmDashboard.jsx
│   ├── services/
│   │   └── api.js       # API service layer
│   └── main.jsx
├── start-dev.sh          # Development startup script
└── package.json
```

---

## 🐛 Troubleshooting

### Error: "This site can't be reached"

**Penyebab:** Server development tidak berjalan

**Solusi:**
1. Pastikan MySQL di XAMPP sudah distart
2. Jalankan `./start-dev.sh`
3. Tunggu hingga kedua server (backend & frontend) aktif

---

### Error: "Can't connect to MySQL"

**Penyebab:** MySQL server tidak aktif

**Solusi:**
1. Buka XAMPP Control Panel
2. Start module MySQL
3. Restart backend server

---

### Error: Data tidak muncul di dashboard

**Penyebab:** Backend tidak running atau database kosong

**Solusi:**
1. Cek backend berjalan di http://localhost:3001/api/health
2. Tambahkan data batch terlebih dahulu di tab "Kandang"
3. Input data harian di tab "Input"

---

## 📞 API Endpoints

### Health Check
```
GET /api/health
```

### Batches
```
GET    /api/batches
POST   /api/batches
PUT    /api/batches/:id
DELETE /api/batches/:id
```

### Daily Records
```
GET    /api/records
POST   /api/records
PUT    /api/records/:id
DELETE /api/records/:id
```

### Analytics
```
GET /api/kpis?days=30
GET /api/analytics/monthly-eggs?months=6
GET /api/analytics/monthly-finance?months=6
GET /api/analytics/cost-per-duck
```

### Settings
```
GET /api/settings
PUT /api/settings/:key
```

---

## 📝 Database Schema

### Batches Table
- Menyimpan data kandang/batch
- Tracking populasi, umur, tipe (pedaging/petelur)

### Daily Records Table
- Data produksi harian
- Mortalitas, pakan, telur, keuangan

### Settings Table
- Konfigurasi aplikasi
- Threshold alerts, WhatsApp number

---

## 🎯 Workflow Penggunaan

1. **Setup Awal:**
   - Start XAMPP MySQL
   - Jalankan `./start-dev.sh`
   - Buat batch/kandang baru di tab "Kandang"

2. **Input Data Harian:**
   - Pilih tab "Input"
   - Pilih batch/kandang
   - Masukkan data produksi hari ini
   - Simpan

3. **Monitor & Analisis:**
   - Lihat KPI real-time di tab "Dashboard"
   - Analisis tren di grafik
   - Bandingkan dengan standar industri di tab "Analisis"

4. **Export & Alert:**
   - Export data ke Excel untuk reporting
   - Setup WhatsApp untuk notifikasi otomatis
   - Terima alert jika ada metric melewati threshold

---

## 📄 License

Private project for duck farm management.

---

## 👨‍💻 Development

**Start Development:**
```bash
./start-dev.sh
```

**Stop Servers:**
Press `Ctrl+C` in terminal

**View Backend Logs:**
Check Terminal 1 (backend)

**View Frontend Logs:**
Check Terminal 2 (frontend)

**Database Management:**
```bash
# Open Prisma Studio
cd backend
npx prisma studio

# Push schema changes
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

---

**Dibuat dengan ❤️ untuk Peternakan Bebek Modern**
