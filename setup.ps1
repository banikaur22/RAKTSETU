# RAKTSETU Setup Script
# Run this once to install dependencies and seed the database
# Usage: Right-click this file -> Run with PowerShell

Write-Host ""
Write-Host "========================================" -ForegroundColor Red
Write-Host "   RAKTSETU - Setup Script" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# ---- Check Python ----
Write-Host "Checking Python..." -ForegroundColor Cyan
$pythonCmd = $null
foreach ($cmd in @("python", "python3", "py")) {
    try {
        $ver = & $cmd --version 2>&1
        if ($ver -match "Python 3") {
            $pythonCmd = $cmd
            Write-Host "  Found: $ver using '$cmd'" -ForegroundColor Green
            break
        }
    } catch {}
}

if (-not $pythonCmd) {
    Write-Host ""
    Write-Host "  ERROR: Python 3 not found!" -ForegroundColor Red
    Write-Host "  Please install Python 3.10+ from https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "  Make sure to check 'Add Python to PATH' during installation." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# ---- Check Node.js ----
Write-Host "Checking Node.js..." -ForegroundColor Cyan
$nodeOk = $false
try {
    $nodeVer = & node --version 2>&1
    if ($nodeVer -match "v") {
        Write-Host "  Found: $nodeVer" -ForegroundColor Green
        $nodeOk = $true
    }
} catch {}

if (-not $nodeOk) {
    Write-Host ""
    Write-Host "  ERROR: Node.js not found!" -ForegroundColor Red
    Write-Host "  Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# ---- Backend setup ----
Write-Host ""
Write-Host "Setting up backend..." -ForegroundColor Cyan
$backendPath = Join-Path $PSScriptRoot "backend"

Set-Location $backendPath

# Create virtual environment
if (-not (Test-Path "venv")) {
    Write-Host "  Creating virtual environment..." -ForegroundColor Gray
    & $pythonCmd -m venv venv
}

# Activate and install
Write-Host "  Installing Python dependencies..." -ForegroundColor Gray
& ".\venv\Scripts\pip.exe" install -r requirements.txt --quiet

# Seed database
Write-Host "  Seeding demo database..." -ForegroundColor Gray
& ".\venv\Scripts\python.exe" seed.py

Write-Host "  Backend setup complete!" -ForegroundColor Green

# ---- Frontend setup ----
Write-Host ""
Write-Host "Setting up frontend..." -ForegroundColor Cyan
$frontendPath = Join-Path $PSScriptRoot "frontend"
Set-Location $frontendPath

Write-Host "  Installing npm dependencies (this may take a minute)..." -ForegroundColor Gray
& npm install

Write-Host "  Frontend setup complete!" -ForegroundColor Green

# ---- Done ----
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To run RAKTSETU:" -ForegroundColor White
Write-Host "  1. Run start_backend.ps1  (in a new terminal)" -ForegroundColor Yellow
Write-Host "  2. Run start_frontend.ps1 (in another terminal)" -ForegroundColor Yellow
Write-Host "  3. Open http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo credentials:" -ForegroundColor White
Write-Host "  Admin:     admin@raktsetu.com     / Admin@123" -ForegroundColor Cyan
Write-Host "  Donor:     donor@raktsetu.com     / Donor@123" -ForegroundColor Cyan
Write-Host "  Requester: requester@raktsetu.com / Requester@123" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
