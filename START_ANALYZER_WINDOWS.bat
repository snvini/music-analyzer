@echo off
setlocal
cd /d "%~dp0"

title MUSIC ANALYZER - STUDIO QUALITY CHECKER

echo ============================================================
echo   MUSIC ANALYZER - UNIFIED STARTUP
echo ============================================================
echo.

:start_detection
:: 1. Verification of Environment
:: Detect Node location without using fragile IF blocks
if exist "bin\node_v22\node.exe" goto :use_local_node
node -v >nul 2>&1
if %errorlevel% neq 0 goto :setup
set "NPM_CMD=npm"
goto :check_modules

:use_local_node
set "PATH=%CD%\bin\node_v22;%PATH%"
set "NPM_CMD=%CD%\bin\node_v22\npm.cmd"
goto :check_modules

:check_modules
if not exist "node_modules" goto :setup
if not exist "backend\node_modules" goto :setup
if not exist "frontend\node_modules" goto :setup

:: Add portable FFmpeg to PATH if it exists locally
if exist "bin\ffmpeg\ffmpeg.exe" (
    set "PATH=%CD%\bin\ffmpeg;%PATH%"
)

:: Check for FFmpeg (either system-wide or in bin\ffmpeg)
ffmpeg -version >nul 2>&1
if %errorlevel% neq 0 (
    if not exist "bin\ffmpeg\ffmpeg.exe" goto :setup
)

goto :launch

:setup
echo [INFO] First time setup or missing files detected...
echo.
if exist "scripts\setup_windows.bat" goto :run_setup
echo [ERROR] Critical file missing: scripts\setup_windows.bat
pause
exit /b 1

:run_setup
call scripts\setup_windows.bat
if %errorlevel% neq 0 goto :setup_error
goto :start_detection

:setup_error
echo.
echo [ERROR] Setup failed. Please check your internet and try again.
pause
exit /b 1

:launch
echo [OK] Environment ready! 🚀
echo.
echo Starting analysis engine...
echo.

:: Start the system using the detected NPM command (Quoted for paths with spaces)
call "%NPM_CMD%" start

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to start. 
    echo Ensure Node.js is installed. Try running scripts\setup_windows.bat manually if this persists.
    pause
    exit /b 1
)

pause
