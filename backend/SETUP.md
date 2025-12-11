# Backend Setup Guide - Duck Farm Dashboard

## Prerequisites
- ✅ XAMPP installed and running
- ✅ MySQL server active (port 3306)
- ✅ Node.js 18+ installed

## Step 1: Start XAMPP MySQL

1. Open **XAMPP Control Panel**
2. Click **Start** on **MySQL** module
3. (Optional) Click **Start** on **Apache** if you want to use phpMyAdmin
4. Open browser and go to `http://localhost/phpmyadmin`
5. Create new database: `duck_farm_db`

## Step 2: Backend Setup (Already Completed ✅)

Backend sudah di-setup dengan lengkap:
- ✅ Node.js project initialized
- ✅ Dependencies installed (Express, Prisma, CORS, etc.)
- ✅ Prisma schema created
- ✅ API controllers & routes ready

## Step 3: Push Database Schema to MySQL

```bash
cd "/Users/mac/Desktop/01. FOLDER IMAM/dashboard bebek/dashboard-bebek-app/backend"
npx prisma db push
```

This command will create all tables in your MySQL database.

## Step 4: Initialize Default Settings

After database is pushed, initialize default settings by making a POST request or running:
```bash
node -e "const prisma = require('./src/config/database'); prisma.setting.createMany({ data: [ { settingKey: 'whatsapp_number', settingValue: '' }, { settingKey: 'mortality_threshold', settingValue: '1.5' }, { settingKey: 'fcr_threshold', settingValue: '2.0' }, { settingKey: 'hdp_threshold', settingValue: '70' }, { settingKey: 'stock_threshold', settingValue: '3' } ] }).then(() => console.log('Settings initialized')).catch(console.error).finally(() => process.exit());"
```

Or simply call the API endpoint:
```bash
curl -X POST http://localhost:3001/api/settings/initialize
```

## Step 5: Start Backend Server

```bash
cd "/Users/mac/Desktop/01. FOLDER IMAM/dashboard bebek/dashboard-bebek-app/backend"
npm run dev
```

Server will run on: **http://localhost:3001**

## Step 6: Test Backend API

Test health endpoint:
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{"status":"OK","message":"Duck Farm API is running"}
```

## API Endpoints Reference

### Batches
- `GET /api/batches` - Get all batches
- `POST /api/batches` - Create batch
- `PUT /api/batches/:id` - Update batch
- `DELETE /api/batches/:id` - Delete batch

### Daily Records
- `GET /api/records` - Get all records
- `POST /api/records` - Create record
- `PUT /api/records/:id` - Update record
- `DELETE /api/records/:id` - Delete record

### KPIs & Analytics
- `GET /api/kpis?days=30` - Get KPIs
- `GET /api/analytics/monthly-eggs?months=6` - Monthly egg trend
- `GET /api/analytics/cost-per-duck` - Cost per duck

### Settings
- `GET /api/settings` - Get all settings
- `PUT /api/settings/:key` - Update setting

## Database Schema

### Tables Created:
1. **batches** - Kandang/batch information
2. **daily_records** - Daily production data
3. **settings** - App settings (WhatsApp, thresholds)

## Troubleshooting

### Error: Can't connect to MySQL
- Make sure XAMPP MySQL is running
- Check if MySQL is on port 3306
- Verify database `duck_farm_db` exists

### Error: P2002 Unique constraint failed
- You're trying to create duplicate data
- Check if record for same batch+date already exists

### Error: Module not found
- Run `npm install` in backend folder
- Make sure you're in the correct directory

## Next Steps

After backend is running successfully:
1. Update frontend to call these APIs
2. Test end-to-end flow
3. Seed database with initial batches
