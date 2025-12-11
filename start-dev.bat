@echo off
echo ================================================
echo Duck Farm Dashboard - Development Startup
echo ================================================
echo.

echo Checking MySQL connection...
mysql -u root -e "SELECT 1" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] MySQL is not running!
    echo.
    echo Please start MySQL in XAMPP Control Panel first:
    echo 1. Open XAMPP Control Panel
    echo 2. Click 'Start' on MySQL module
    echo 3. Run this script again
    pause
    exit /b 1
)
echo [OK] MySQL is running

echo.
echo Checking database...
mysql -u root -e "CREATE DATABASE IF NOT EXISTS duck_farm_db"
echo [OK] Database ready

echo.
echo Starting Backend Server...
cd backend
start "Duck Farm Backend" cmd /k npm run dev
timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend Server...
cd ..
start "Duck Farm Frontend" cmd /k npm run dev

echo.
echo ================================================
echo Servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5174
echo ================================================
echo.
echo Close the server windows to stop the servers.
pause
