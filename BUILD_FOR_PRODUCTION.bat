@echo off
REM BUILD FOR PRODUCTION (HOSTINGER DEPLOYMENT)
echo ========================================
echo  BUILDING FOR PRODUCTION DEPLOYMENT
echo ========================================

REM Copy production environment files
echo.
echo [1/3] Setting up PRODUCTION environment files...
copy /Y street_light_control_backend\.env_global street_light_control_backend\.env
copy /Y street_light_control_frontend\.env street_light_control_frontend\.env.production

echo.
echo [2/3] Installing dependencies...
cd street_light_control_frontend
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [3/3] Building production bundle...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

cd ..
echo.
echo ========================================
echo  BUILD SUCCESSFUL!
echo ========================================
echo  Output folder: street_light_control_frontend\build\
echo.
echo  Next steps:
echo  1. Upload 'build' folder to Hostinger public_html
echo  2. Upload 'street_light_control_backend' to Hostinger
echo  3. Import database.sql to Hostinger MySQL
echo  4. Configure .htaccess files
echo ========================================
pause
