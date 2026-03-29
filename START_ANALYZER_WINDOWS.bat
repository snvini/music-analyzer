@echo off
setlocal
cd /d "%~dp0"

title MUSIC ANALYZER - STUDIO QUALITY CHECKER

echo ============================================================
echo   MUSIC ANALYZER - UNIFIED STARTUP
echo ============================================================
echo.

:: 1. Verification of Environment
:: Add local node to PATH if it exists
if exist "bin\node" (
    set "PATH=%cd%\bin\node;%PATH%"
)

if not exist "node_modules" (
    goto :setup
)
if not exist "backend\node_modules" (
    goto :setup
)
if not exist "frontend\node_modules" (
    goto :setup
)
goto :launch

:setup
echo [INFO] First time setup or missing files detected...
echo.
call scripts\setup_windows.bat
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Setup failed. Please check your internet and try again.
    pause
    exit /b 1
)
goto :launch

:launch
echo [OK] Environment ready! 🚀
echo.
echo Starting analysis engine and user interface...
echo.

:: Launch browser in background (wait 5 sec for server)
start /b cmd /c "timeout /t 5 >nul && start http://localhost:5173"

:: Start the system
npm start

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to start. 
    echo Ensure Node.js is installed. Try running scripts\setup_windows.bat manually if this persists.
    pause
    exit /b 1
)

pause
