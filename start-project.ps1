Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Starting CareerForge AI Services..." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

Write-Host "[1/2] Starting Python Backend on port 8003..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd python-backend; `$env:PORT=8003; ..\ResumeAI\.venv\Scripts\python.exe main.py"

Write-Host "[2/2] Starting Next.js Frontend on port 3000..." -ForegroundColor Yellow
npm run dev
