# START LOCAL DEVELOPMENT ENVIRONMENT
Write-Host "========================================"
Write-Host " STARTING LOCAL DEVELOPMENT SERVERS"
Write-Host "========================================" -ForegroundColor Green

# Copy local environment files
Write-Host "`n[1/4] Setting up LOCAL environment files..." -ForegroundColor Yellow
Copy-Item -Path "street_light_control_backend\.env.local" -Destination "street_light_control_backend\.env" -Force
Copy-Item -Path "street_light_control_frontend\.env.local" -Destination "street_light_control_frontend\.env.development.local" -Force
Write-Host "✓ Environment files configured" -ForegroundColor Green

# Start MySQL
Write-Host "`n[2/4] Starting MySQL Service..." -ForegroundColor Yellow
try {
    Start-Service MySQL80 -ErrorAction Stop
    Write-Host "✓ MySQL service started" -ForegroundColor Green
} catch {
    Write-Host "⚠ MySQL might be already running or service name is different" -ForegroundColor Yellow
}

# Start Backend
Write-Host "`n[3/4] Starting Backend Server (PHP)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\street_light_control_backend'; php -S localhost:8000"
Write-Host "✓ Backend starting on http://localhost:8000/api" -ForegroundColor Green

# Wait and start Frontend
Write-Host "`n[4/4] Starting Frontend Server (React)..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\street_light_control_frontend'; npm start"
Write-Host "✓ Frontend starting on http://localhost:3000" -ForegroundColor Green

Write-Host "`n========================================"
Write-Host " LOCAL SERVERS STARTED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host " Backend:  http://localhost:8000/api"
Write-Host " Frontend: http://localhost:3000"
Write-Host "========================================`n"
Write-Host "Login credentials:"
Write-Host "Email: admin@streetlight.com"
Write-Host "Password: admin123`n"
