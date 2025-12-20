# Street Light Control System - Startup Script
# Run this to start both backend and frontend servers

Write-Host "`n=== Street Light Control System ===" -ForegroundColor Cyan
Write-Host "Starting servers...`n" -ForegroundColor Cyan

# Backend setup
$BackendPath = "C:\Users\rakes\OneDrive\Desktop\Repo\Street_Light_Control_Systems\backend"
$PhpPath = "C:\Users\rakes\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe"

# Frontend setup
$FrontendPath = "C:\Users\rakes\OneDrive\Desktop\Repo\Street_Light_Control_Systems\frontend"

# Check if PHP exists
if (-not (Test-Path $PhpPath)) {
    Write-Host "ERROR: PHP not found at $PhpPath" -ForegroundColor Red
    Write-Host "Please install PHP or update the path in this script." -ForegroundColor Yellow
    pause
    exit
}

# Check if backend exists
if (-not (Test-Path "$BackendPath\index.php")) {
    Write-Host "ERROR: Backend not found at $BackendPath" -ForegroundColor Red
    pause
    exit
}

# Check if frontend exists
if (-not (Test-Path "$FrontendPath\package.json")) {
    Write-Host "ERROR: Frontend not found at $FrontendPath" -ForegroundColor Red
    pause
    exit
}

Write-Host "[1/3] Starting PHP Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendPath'; Write-Host 'Backend Server Starting...' -ForegroundColor Green; & '$PhpPath' -S localhost:8000 index.php"

Start-Sleep -Seconds 2

Write-Host "[2/3] Checking if backend is ready..." -ForegroundColor Yellow
$retries = 0
$maxRetries = 10
$backendReady = $false

while ($retries -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/api/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            Write-Host "✓ Backend is ready!" -ForegroundColor Green
            break
        }
    } catch {
        $retries++
        Write-Host "  Waiting for backend... ($retries/$maxRetries)" -ForegroundColor Gray
        Start-Sleep -Seconds 1
    }
}

if (-not $backendReady) {
    Write-Host "WARNING: Backend may not be ready. Check the backend terminal window." -ForegroundColor Yellow
}

Write-Host "[3/3] Starting React Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FrontendPath'; Write-Host 'Frontend Starting...' -ForegroundColor Green; npm start"

Write-Host "`n=== Servers Started ===" -ForegroundColor Green
Write-Host "Backend API: http://localhost:8000/api" -ForegroundColor Cyan
Write-Host "Frontend:    http://localhost:3000 (will open automatically)" -ForegroundColor Cyan
Write-Host "`nDefault Login:" -ForegroundColor Yellow
Write-Host "  Email:    admin@streetlight.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host "`nPress any key to close this window (servers will keep running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
