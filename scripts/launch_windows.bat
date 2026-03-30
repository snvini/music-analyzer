@echo off
setlocal
title Music Analyzer - Studio Quality Checker
cd /d "%~dp0"

echo ============================================================
echo   MUSIC ANALYZER - STUDIO QUALITY CHECKER
echo ============================================================
echo.

:: 1. Setup Verification
if not exist "node_modules\" (
    echo [WARNING] Project is not configured yet.
    echo Running setup automatically for you...
    echo.
    call setup_windows.bat
    if %errorlevel% neq 0 goto :error
)

if not exist "backend\node_modules\" (
    echo [ERROR] Backend dependencies missing. Running setup...
    call setup_windows.bat
)

if not exist "frontend\node_modules\" (
    echo [ERROR] Frontend dependencies missing. Running setup...
    call setup_windows.bat
)

:: 2. Launching Everything
echo Environment successfully verified!
echo.
echo Starting analysis engine and user interface...
echo A browser window will open shortly.
echo.

:: Use root package.json to run concurrently
echo Opening browser...
start "" http://localhost:5173
call npm start

:error
echo [ERROR] Failed to start Music Analyzer.
echo Please ensure Node.js is installed and try running 'setup.bat' again.
pause
exit /b 1
