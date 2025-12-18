@echo off
REM Start PHP backend with error checking
setlocal enabledelayedexpansion

echo.
echo ============================================
echo  Street Light Control System - Backend
echo ============================================
echo.

cd /d "%~dp0"

REM Check if we're in the right directory
if not exist "index.php" (
    echo ERROR: index.php not found!
    echo Current directory: %cd%
    pause
    exit /b 1
)

echo Starting PHP server on localhost:8000...
echo Backend URL: http://localhost:8000/api
echo.
echo Press Ctrl+C to stop the server
echo.

"C:\Users\rakes\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe" -S localhost:8000

if errorlevel 1 (
    echo.
    echo ERROR: PHP server failed to start!
    pause
    exit /b 1
)
