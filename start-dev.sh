#!/bin/bash

# Duck Farm Dashboard - Development Startup Script
# This script will start both backend and frontend servers

echo "🦆 Duck Farm Dashboard - Starting Development Environment"
echo "=========================================================="

# Check if MySQL is running
echo ""
echo "1️⃣  Checking MySQL connection..."

# Try XAMPP MySQL path first (macOS)
MYSQL_CMD="/Applications/XAMPP/bin/mysql"
if [ ! -f "$MYSQL_CMD" ]; then
    # Fallback to system mysql
    MYSQL_CMD="mysql"
fi

# Test MySQL connection
if $MYSQL_CMD -u root -e "SELECT 1" &>/dev/null; then
    echo "✅ MySQL is running"
elif lsof -i :3306 &>/dev/null; then
    echo "✅ MySQL is running on port 3306"
    MYSQL_CMD="/Applications/XAMPP/bin/mysql"
else
    echo "❌ MySQL is not running!"
    echo ""
    echo "Please start MySQL in XAMPP Control Panel first:"
    echo "1. Open XAMPP Control Panel"
    echo "2. Click 'Start' on MySQL module"
    echo "3. Run this script again"
    exit 1
fi

# Check if database exists
echo ""
echo "2️⃣  Checking database..."
DB_EXISTS=$($MYSQL_CMD -u root -e "SHOW DATABASES LIKE 'duck_farm_db'" -s 2>/dev/null)
if [ -z "$DB_EXISTS" ]; then
    echo "⚠️  Database 'duck_farm_db' not found. Creating..."
    $MYSQL_CMD -u root -e "CREATE DATABASE duck_farm_db"
    echo "✅ Database created"
else
    echo "✅ Database 'duck_farm_db' exists"
fi

# Navigate to backend and check if node_modules exists
echo ""
echo "3️⃣  Checking backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "⚠️  Installing backend dependencies..."
    npm install
fi
echo "✅ Backend dependencies ready"

# Push Prisma schema
echo ""
echo "4️⃣  Syncing database schema..."
npx prisma db push --skip-generate 2>/dev/null || npx prisma db push
echo "✅ Database schema synced"

# Go back to root
cd ..

# Check frontend dependencies
echo ""
echo "5️⃣  Checking frontend dependencies..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  Installing frontend dependencies..."
    npm install
fi
echo "✅ Frontend dependencies ready"

echo ""
echo "=========================================================="
echo "🚀 Starting Development Servers..."
echo "=========================================================="
echo ""
echo "Backend will run on: http://localhost:3001"
echo "Frontend will run on: http://localhost:5174"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start backend in background
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend in foreground
npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
