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
if %errorlevel% neq 0 goto :check_local_node
echo [OK] Node.js is already installed on the system.
goto :node_ready

:check_local_node
if exist "bin\node_v22\node.exe" goto :local_node_found
echo [INFO] Node.js not found or outdated in system.
echo We will now download a portable version to run the analyzer automatically...

if not exist "bin" mkdir "bin"
curl -L --progress-bar "https://nodejs.org/dist/v22.13.1/node-v22.13.1-win-x64.zip" -o "bin\node.zip"
if %errorlevel% neq 0 (
    echo [ERROR] Download failed. Check your connection.
    pause
    exit /b 1
)

echo Extracting Node.js...
:: Clean up any partial install
if exist "bin\node_v22" rmdir /s /q "bin\node_v22"
powershell -Command "Expand-Archive -Path 'bin\node.zip' -DestinationPath 'bin\node_tmp'; $folder = Get-ChildItem 'bin\node_tmp' | Select-Object -First 1; Move-Item \"$($folder.FullName)\" 'bin\node_v22'; Remove-Item 'bin\node_tmp' -Recurse -Force; Remove-Item 'bin\node.zip' -Force"

if not exist "bin\node_v22\node.exe" (
    echo [ERROR] Logic failure during Node.js extraction.
    pause
    exit /b 1
)

:local_node_found
set "NODE_BINARY=%ROOT_DIR%\bin\node\node.exe"
echo [OK] Portable Node.js found locally.
goto :node_ready

:node_ready
:: 2. Check for FFmpeg
echo [2/4] Verifying FFmpeg (Required for audio analysis)...
ffmpeg -version >nul 2>&1
if %errorlevel% neq 0 goto :check_local_ffmpeg
echo [OK] FFmpeg detected.
goto :ffmpeg_ready

:check_local_ffmpeg
if not exist "%ROOT_DIR%\bin" mkdir "%ROOT_DIR%\bin"
:: Verifica na pasta unificada (bin\ffmpeg\)
if exist "%ROOT_DIR%\bin\ffmpeg\ffmpeg.exe" goto :local_ffmpeg_found

echo FFmpeg not found. Downloading Lightweight version (~60MB)...
:: Usando ffbinaries para Windows (Download direto, mais leve e rápido)
curl -L --progress-bar "https://ffbinaries.com/api/v1/get?components=ffmpeg&os=windows-64" -o "%ROOT_DIR%\bin\ffmpeg_temp.zip"
curl -L --progress-bar "https://ffbinaries.com/api/v1/get?components=ffprobe&os=windows-64" -o "%ROOT_DIR%\bin\ffprobe_temp.zip"

if %errorlevel% neq 0 (
    echo [ERROR] FFmpeg download failed. Please check your internet.
    pause
    exit /b 1
)

echo Extracting FFmpeg & FFprobe...
:: Limpeza de qualquer instalação parcial anterior
if exist "%ROOT_DIR%\bin\ffmpeg" rmdir /s /q "%ROOT_DIR%\bin\ffmpeg"
mkdir "%ROOT_DIR%\bin\ffmpeg"

powershell -Command "Expand-Archive -Path '%ROOT_DIR%\bin\ffmpeg_temp.zip' -DestinationPath '%ROOT_DIR%\bin\ffmpeg\'; Expand-Archive -Path '%ROOT_DIR%\bin\ffprobe_temp.zip' -DestinationPath '%ROOT_DIR%\bin\ffmpeg\'; Remove-Item '%ROOT_DIR%\bin\ffmpeg_temp.zip'; Remove-Item '%ROOT_DIR%\bin\ffprobe_temp.zip'"

if not exist "%ROOT_DIR%\bin\ffmpeg\ffmpeg.exe" (
    echo [ERROR] Logic failure during FFmpeg extraction.
    pause
    exit /b 1
)
goto :local_ffmpeg_found

:local_ffmpeg_found
echo [OK] Portable FFmpeg installed to bin\
goto :ffmpeg_ready

:ffmpeg_ready
echo.

:: 3. Install dependencies
echo [3/4] Installing project dependencies... (This may take a few minutes)
echo.

:: If using PORTABLE node, we need to add it to PATH for npm to work properly
if "%NODE_BINARY%" neq "node" set "PATH=%ROOT_DIR%\bin\node_v22;%PATH%"

:: Decide which NPM to use
set "NPM_EXEC=npm"
if "%NODE_BINARY%" neq "node" set "NPM_EXEC=%ROOT_DIR%\bin\node_v22\npm.cmd"

echo -- Installing Root dependencies...
call %NPM_EXEC% install 2>nul
if %errorlevel% neq 0 echo [WARNING] Root dependencies check failed, continuing...

echo -- Installing Backend dependencies...
cd /d "%ROOT_DIR%\backend"
call %NPM_EXEC% install
if %errorlevel% neq 0 goto :error

echo -- Installing Frontend dependencies...
cd /d "%ROOT_DIR%\frontend"
call %NPM_EXEC% install
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

:download_error
echo.
echo [ERROR] Failed to download from Node.js or FFmpeg server. 
echo Please check your internet connection.
pause
exit /b 1

:error
echo.
echo [ERROR] A problem occurred during dependency installation.
echo Please check your internet connection and try again.
pause
exit /b 1
