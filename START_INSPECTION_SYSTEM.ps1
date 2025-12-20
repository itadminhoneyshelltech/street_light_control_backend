#!/usr/bin/env powershell
# START_INSPECTION_SYSTEM.ps1
# Quick start script for the Inspection Feature system

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "🔦 Street Light Inspection System" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Get the directory where this script is located
$scriptDir = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
$backendDir = Join-Path $scriptDir "street_light_control_backend"
$frontendDir = Join-Path $scriptDir "street_light_control_frontend"

Write-Host "Project Directory: $scriptDir" -ForegroundColor Gray
Write-Host ""

# Function to start a service
function Start-Service-Window {
    param(
        [string]$Title,
        [string]$WorkingDirectory,
        [string]$Command
    )
    
    Write-Host "Starting: $Title..." -ForegroundColor Green
    
    # Start the process in a new window
    if (Test-Path $WorkingDirectory) {
        Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd '$WorkingDirectory'; $Command" -WindowStyle Normal
        Write-Host "✓ $Title started in new window" -ForegroundColor Green
    } else {
        Write-Host "✗ Directory not found: $WorkingDirectory" -ForegroundColor Red
    }
}

Write-Host "Services Available:" -ForegroundColor Cyan
Write-Host "1. Backend (PHP) - port 8000" -ForegroundColor White
Write-Host "2. Frontend (React) - port 3001" -ForegroundColor White
Write-Host "3. Verification - check setup" -ForegroundColor White
Write-Host ""

# Menu
$choice = Read-Host "Select option (1-3) or 'all' to start all [1]"
if ([string]::IsNullOrWhiteSpace($choice)) { $choice = "1" }

switch ($choice) {
    "1" {
        Write-Host "Starting Backend Server..." -ForegroundColor Cyan
        Start-Service-Window -Title "Backend" -WorkingDirectory $backendDir -Command "php -S localhost:8000; Read-Host 'Press Enter to exit'"
    }
    "2" {
        Write-Host "Starting Frontend Server..." -ForegroundColor Cyan
        Start-Service-Window -Title "Frontend" -WorkingDirectory $frontendDir -Command "npm start; Read-Host 'Press Enter to exit'"
    }
    "3" {
        Write-Host "Running Verification..." -ForegroundColor Cyan
        $php = Join-Path $backendDir "verify-inspection-setup.php"
        if (Test-Path $php) {
            Push-Location $backendDir
            php $php
            Pop-Location
        } else {
            Write-Host "✗ Verification script not found" -ForegroundColor Red
        }
    }
    "all" {
        Write-Host "Starting all services..." -ForegroundColor Cyan
        Start-Service-Window -Title "Backend" -WorkingDirectory $backendDir -Command "php -S localhost:8000; Read-Host 'Press Enter to exit'"
        Start-Sleep -Seconds 2
        Start-Service-Window -Title "Frontend" -WorkingDirectory $frontendDir -Command "npm start; Read-Host 'Press Enter to exit'"
    }
    default {
        Write-Host "Invalid choice" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Quick Start Guide:" -ForegroundColor Green
Write-Host "  → INSPECTION_QUICK_START.md" -ForegroundColor White
Write-Host ""
Write-Host "Complete Documentation:" -ForegroundColor Green
Write-Host "  → INSPECTION_FEATURE_GUIDE.md" -ForegroundColor White
Write-Host ""
Write-Host "API Testing:" -ForegroundColor Green
Write-Host "  → http://localhost:8000/TEST_INSPECTION_FLOW.html" -ForegroundColor White
Write-Host ""
Write-Host "File Manifest:" -ForegroundColor Green
Write-Host "  → FILE_MANIFEST_INSPECTION.md" -ForegroundColor White
Write-Host ""
