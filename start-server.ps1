#!/usr/bin/env pwsh
# Start the PHP backend development server

$PHP_PATH = "C:\Users\rakes\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe"
$BACKEND_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Starting PHP Backend Server..." -ForegroundColor Green
Write-Host "Backend API will be available at: http://localhost:8000/api" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

& $PHP_PATH -S localhost:8000 -t $BACKEND_DIR "$BACKEND_DIR\index.php"
