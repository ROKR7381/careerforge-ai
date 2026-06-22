@echo off
title CareerForge AI - Runner
echo ==========================================
echo   Starting CareerForge AI Services...
echo ==========================================

echo [1/2] Starting Python Backend on port 8003...
start "CareerForge AI - Python Backend" cmd /k "cd python-backend && set PORT=8003 && ..\ResumeAI\.venv\Scripts\python.exe main.py"

echo [2/2] Starting Next.js Frontend on port 3001...
set PORT=3001
npm run dev
