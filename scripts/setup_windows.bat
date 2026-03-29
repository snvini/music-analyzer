@echo off
setlocal
title Music Analyzer - Setup Wizard

echo ============================================================
echo   MUSIC ANALYZER - STUDIO QUALITY CHECKER SETUP
echo ============================================================
:: Set DIR to the project root (one level up from scripts\)
set "SCRIPTS_DIR=%~dp0"
cd /d "%SCRIPTS_DIR%.."
set "ROOT_DIR=%cd%"
echo.

:: 1. Check for Node.js
echo [1/4] Verifying Node.js installation...
set "NODE_BINARY=node"
node -v >nul 2>&1
if %errorlevel% neq 0 (
    if exist "bin\node\node.exe" (
        set "NODE_BINARY=%ROOT_DIR%\bin\node\node.exe"
        echo [OK] Portable Node.js found locally.
    ) else (
        echo [INFO] Node.js not found in system.
        echo We will now download a portable version to run the analyzer automatically...
        
        powershell -Command "Write-Host 'Downloading Node.js v20 LTS...'; New-Item -ItemType Directory -Force -Path 'bin'; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.1/node-v20.11.1-win-x64.zip' -OutFile 'bin\node.zip'"
        
        if %errorlevel% neq 0 (
            echo [ERROR] Failed to download Node.js. Check your internet.
            pause
            exit /b 1
        )
        
        echo Extracting Node.js...
        powershell -Command "Expand-Archive -Path 'bin\node.zip' -DestinationPath 'bin\node_tmp'; $folder = Get-ChildItem 'bin\node_tmp' | Select-Object -First 1; Move-Item \"$($folder.FullName)\*\" 'bin\node'; Remove-Item 'bin\node_tmp' -Recurse; Remove-Item 'bin\node.zip'"
        
        set "NODE_BINARY=%ROOT_DIR%\bin\node\node.exe"
        echo [OK] Portable Node.js installed to bin\node
    )
) else (
    echo [OK] Node.js is already installed on the system.
)

:: Update PATH for the current session to include portable node/npm
set "PATH=%ROOT_DIR%\bin\node;%PATH%"

:: 2. Check for FFmpeg
echo [2/4] Verifying FFmpeg (Required for audio analysis)...
ffmpeg -version >nul 2>&1
if %errorlevel% neq 0 (
    if exist "bin\ffmpeg.exe" (
        echo [OK] FFmpeg found in bin\ directory.
    ) else (
        echo FFmpeg not found. Downloading portable version...
        powershell -Command "Write-Host 'Downloading FFmpeg...'; Invoke-WebRequest -Uri 'https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip' -OutFile 'bin\ffmpeg.zip'"
        
        echo Extracting FFmpeg...
        powershell -Command "Expand-Archive -Path 'bin\ffmpeg.zip' -DestinationPath 'bin\ffmpeg_tmp'; Get-ChildItem -Path 'bin\ffmpeg_tmp\*\bin\*' | Move-Item -Destination 'bin\'; Remove-Item 'bin\ffmpeg_tmp' -Recurse; Remove-Item 'bin\ffmpeg.zip'"
        
        echo [OK] Portable FFmpeg installed to bin\
    )
) else (
    echo [OK] FFmpeg detected.
)
echo.

:: 3. Install dependencies
echo [3/4] Installing project dependencies... (This may take a few minutes)
echo.

echo -- Installing Root dependencies...
call "%NODE_BINARY%" "%ROOT_DIR%\bin\node\node_modules\npm\bin\npm-cli.js" install 2>nul || call npm install
if %errorlevel% neq 0 echo [WARNING] Root dependencies check failed, continuing...

echo -- Installing Backend dependencies...
cd /d "%ROOT_DIR%\backend"
call "%NODE_BINARY%" "%ROOT_DIR%\bin\node\node_modules\npm\bin\npm-cli.js" install 2>nul || call npm install
if %errorlevel% neq 0 goto :error

echo -- Installing Frontend dependencies...
cd /d "%ROOT_DIR%\frontend"
call "%NODE_BINARY%" "%ROOT_DIR%\bin\node\node_modules\npm\bin\npm-cli.js" install 2>nul || call npm install
if %errorlevel% neq 0 goto :error

cd /d "%ROOT_DIR%"
echo.
echo [4/4] Finalizing configuration...
echo.
echo ============================================================
echo   SETUP COMPLETED SUCCESSFULLY! 🚀
echo ============================================================
echo.
echo You can now use 'START_ANALYZER_WINDOWS.bat' 
echo to start the system automatically.
echo.
timeout /t 5
exit /b 0

:error
echo.
echo [ERROR] A problem occurred during dependency installation.
echo Please check your internet connection and try again.
pause
exit /b 1
