# RAKTSETU - Start Frontend Dev Server
# Usage: Right-click -> Run with PowerShell  OR  run in terminal

$frontendPath = Join-Path $PSScriptRoot "frontend"
Set-Location $frontendPath

Write-Host ""
Write-Host "========================================" -ForegroundColor Red
Write-Host "  RAKTSETU Frontend - React/Vite" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
    & npm install
}

Write-Host "Starting Vite dev server on http://localhost:5173" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop" -ForegroundColor Gray
Write-Host ""

& npm run dev
