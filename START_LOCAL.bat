@echo off
REM START LOCAL DEVELOPMENT ENVIRONMENT
echo ========================================
echo  STARTING LOCAL DEVELOPMENT SERVERS
echo ========================================

REM Copy local environment files
echo.
echo [1/4] Setting up LOCAL environment files...
copy /Y street_light_control_backend\.env.local street_light_control_backend\.env
copy /Y street_light_control_frontend\.env.local street_light_control_frontend\.env.development.local

echo.
echo [2/4] Starting MySQL Service...
net start MySQL80 2>nul || net start MySQL 2>nul || echo MySQL might be already running

echo.
echo [3/4] Starting Backend Server (PHP)...
start "Backend Server" cmd /k "cd street_light_control_backend && php -S localhost:8000"

echo.
echo [4/4] Starting Frontend Server (React)...
timeout /t 3 /nobreak >nul
start "Frontend Server" cmd /k "cd street_light_control_frontend && npm start"

echo.
echo ========================================
echo  LOCAL SERVERS STARTED!
echo ========================================
echo  Backend:  http://localhost:8000/api
echo  Frontend: http://localhost:3000
echo ========================================
echo.
echo Login credentials:
echo Email: admin@streetlight.com
echo Password: admin123
echo.
pause
