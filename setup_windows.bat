@echo off
setlocal
title Music Analyzer - Setup Wizard

echo ============================================================
echo   MUSIC ANALYZER - STUDIO QUALITY CHECKER SETUP
echo ============================================================
echo.

:: 1. Check for Node.js
echo [1/4] Verifying Node.js installation...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install from: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js detected.
echo.

:: 2. Check for FFmpeg
echo [2/4] Verifying FFmpeg (Required for audio analysis)...
ffmpeg -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] FFmpeg not found in your PATH.
    echo Would you like me to try installing it via Windows Winget? (Y/N)
    set /p install_ffmpeg=
    if /i "%install_ffmpeg%"=="Y" (
        echo Attempting to install FFmpeg...
        winget install Gyan.FFmpeg
        if %errorlevel% neq 0 (
            echo [ERROR] Failed to install via Winget. 
            echo Please install manually: https://ffmpeg.org/download.html
            pause
        ) else (
            echo [OK] FFmpeg installed! Please restart this setup after installation completes.
            pause
            exit /b 0
        )
    ) else (
        echo [WARNING] The system will not function without FFmpeg.
        echo Download at: https://www.gyan.dev/ffmpeg/builds/
    )
) else (
    echo [OK] FFmpeg detected.
)
echo.

:: 3. Install dependencies
echo [3/4] Installing project dependencies (npm install)...
echo This may take a minute...
echo.

echo -- Installing Root dependencies...
call npm install --no-fund --no-audit
if %errorlevel% neq 0 goto :error

echo -- Installing Backend dependencies...
cd backend
call npm install --no-fund --no-audit
cd ..
if %errorlevel% neq 0 goto :error

echo -- Installing Frontend dependencies...
cd frontend
call npm install --no-fund --no-audit
cd ..
if %errorlevel% neq 0 goto :error

echo.
echo [4/4] Finalizing configuration...
echo.
echo ============================================================
echo   SETUP COMPLETED SUCCESSFULLY! 🚀
echo ============================================================
echo.
echo You can now use 'Launch_Music_Analyzer.bat' 
echo to start the system automatically.
echo.
pause
exit /b 0

:error
echo.
echo [ERROR] A problem occurred during dependency installation.
echo Please check your internet connection and try again.
pause
exit /b 1
