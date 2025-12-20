@echo off
echo Starting PHP Backend Server...
echo Backend API will be available at: http://localhost:8000/api
echo Press Ctrl+C to stop the server
echo.
cd /d "%~dp0"
"C:\Users\rakes\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe" -S localhost:8000 index.php
