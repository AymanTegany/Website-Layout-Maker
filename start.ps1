# This script starts both the backend and frontend servers in separate PowerShell windows.

# Set location to the project root directory
Set-Location $PSScriptRoot

Write-Host "----------------------------------------------" -ForegroundColor Green
Write-Host "      DTuin Faculty Hub - Start Script        " -ForegroundColor Green
Write-Host "----------------------------------------------" -ForegroundColor Green

# 1. Start Express Backend Server
Write-Host "[1/2] Starting API Backend Server on port 8081..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PORT='8081'; `$env:DATABASE_URL='postgresql://postgres:postgres@localhost:5432/postgres'; npx pnpm --filter @workspace/api-server run start"

# 2. Start Vite Frontend Server
Write-Host "[2/2] Starting React Frontend Dev Server on port 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PORT='3000'; `$env:BASE_PATH='/'; npx pnpm --filter @workspace/dtuin-hub run dev"

Write-Host ""
Write-Host "Servers have been launched in separate windows!" -ForegroundColor Green
Write-Host "  * Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "  * Backend:  http://localhost:8081" -ForegroundColor Yellow
Write-Host "----------------------------------------------" -ForegroundColor Green
