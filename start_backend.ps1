# RAKTSETU - Start Backend Server
# Usage: Right-click -> Run with PowerShell  OR  run in terminal

$backendPath = Join-Path $PSScriptRoot "backend"
Set-Location $backendPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Red
Write-Host "  RAKTSETU Backend - Flask API Server" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# Check if venv exists
if (-not (Test-Path "venv\Scripts\python.exe")) {
    Write-Host "Virtual environment not found. Running setup first..." -ForegroundColor Yellow
    Set-Location $PSScriptRoot
    & .\setup.ps1
    Set-Location $backendPath
}

# Check if database exists, seed if not
if (-not (Test-Path "instance\raktsetu.db") -and -not (Test-Path "raktsetu.db")) {
    Write-Host "Database not found. Seeding demo data..." -ForegroundColor Yellow
    & ".\venv\Scripts\python.exe" seed.py
}

Write-Host "Starting Flask server on http://localhost:5000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

$env:FLASK_APP = "app.py"
$env:FLASK_ENV = "development"
& ".\venv\Scripts\python.exe" app.py
