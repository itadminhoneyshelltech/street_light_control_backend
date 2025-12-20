@echo off
REM START_SERVERS.bat
REM This batch script starts all servers for Street Light Control System on Windows

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   Street Light Control System
echo   Starting All Services
echo ========================================
echo.

REM Get the script directory
set SCRIPT_DIR=%~dp0

REM Start PHP Backend
echo [1/2] Starting PHP Backend on localhost:8000...
cd /d "%SCRIPT_DIR%street_light_control_backend"
start "PHP Backend - localhost:8000" php -S localhost:8000 index.php
echo.
echo      PHP Backend started!
echo      URL: http://localhost:8000/api
echo.
timeout /t 3 /nobreak

REM Start React Frontend
echo [2/2] Starting React Frontend on localhost:3001...
cd /d "%SCRIPT_DIR%street_light_control_frontend"
start "React Frontend - localhost:3001" npx react-scripts start
echo.
echo      React Frontend started!
echo      URL: http://localhost:3001
echo.
timeout /t 5 /nobreak

REM Display information
echo.
echo ========================================
echo   All Services Started Successfully!
echo ========================================
echo.
echo   FRONTEND:     http://localhost:3001
echo   API:          http://localhost:8000/api
echo   API TESTER:   http://localhost:8000/TEST_API_FLOW.html
echo.
echo   CREDENTIALS:
echo   Email:        admin@streetlight.com
echo   Password:     admin123
echo.
echo   Close this window to stop all services
echo ========================================
echo.

pause
