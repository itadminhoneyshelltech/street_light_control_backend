# BUILD FOR PRODUCTION (HOSTINGER DEPLOYMENT)
Write-Host "========================================"
Write-Host " BUILDING FOR PRODUCTION DEPLOYMENT"
Write-Host "========================================" -ForegroundColor Green

# Copy production environment files
Write-Host "`n[1/3] Setting up PRODUCTION environment files..." -ForegroundColor Yellow
Copy-Item -Path "street_light_control_backend\.env_global" -Destination "street_light_control_backend\.env" -Force
Copy-Item -Path "street_light_control_frontend\.env" -Destination "street_light_control_frontend\.env.production" -Force
Write-Host "✓ Production environment configured" -ForegroundColor Green

# Install dependencies
Write-Host "`n[2/3] Installing dependencies..." -ForegroundColor Yellow
Set-Location street_light_control_frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Build production bundle
Write-Host "`n[3/3] Building production bundle..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build completed" -ForegroundColor Green

Set-Location ..
Write-Host "`n========================================"
Write-Host " BUILD SUCCESSFUL!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host " Output folder: street_light_control_frontend\build\"
Write-Host "`nNext steps:"
Write-Host " 1. Upload 'build' folder to Hostinger public_html"
Write-Host " 2. Upload 'street_light_control_backend' to Hostinger"
Write-Host " 3. Import database.sql to Hostinger MySQL"
Write-Host " 4. Configure .htaccess files"
Write-Host "========================================`n"
