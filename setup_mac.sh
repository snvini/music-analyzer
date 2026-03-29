#!/bin/bash

# Music Analyzer - macOS / Linux Setup Wizard
cd "$(dirname "$0")"
echo "============================================================"
echo "  MUSIC ANALYZER - STUDIO QUALITY CHECKER SETUP (UNIX)"
echo "============================================================"
echo

# 1. Check for Node.js
echo "[1/4] Verifying Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js not found."
    echo "Node.js is mandatory to run this project."
    echo "Please download and install it from: https://nodejs.org/"
    echo "After installing, please restart this setup."
    exit 1
fi
echo "[OK] Node.js detected: $(node -v)"
echo

# 2. Check for FFmpeg (Prioritizing local portable install)
echo "[2/4] Verifying FFmpeg (Required for audio analysis)..."
LOCAL_FFMPEG="./bin/ffmpeg"
if ! command -v ffmpeg &> /dev/null && [ ! -f "$LOCAL_FFMPEG" ]; then
    echo "[WARNING] FFmpeg not found on your system."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Would you like me to download a PORTABLE version of FFmpeg automatically? (Recommended) (y/n)"
        read -r install_portable
        if [[ $install_portable == "y" ]]; then
            echo "Creating local bin folder..."
            mkdir -p bin
            
            echo "Downloading FFmpeg Static Binary for Mac (this may take a minute)..."
            curl -L -o ffmpeg.zip https://evermeet.cx/ffmpeg/get/zip
            unzip -o ffmpeg.zip -d bin/
            rm ffmpeg.zip
            
            echo "Downloading FFprobe Static Binary for Mac..."
            curl -L -o ffprobe.zip https://evermeet.cx/ffprobe/get/zip
            unzip -o ffprobe.zip -d bin/
            rm ffprobe.zip
            
            chmod +x bin/ffmpeg bin/ffprobe
            echo "[OK] Portable FFmpeg installed inside the project folder."
        fi
    else
        echo "Please install FFmpeg via your package manager (e.g., sudo apt install ffmpeg)."
    fi
else
    echo "[OK] FFmpeg binary found."
fi
echo

# 3. Install dependencies
echo "[3/4] Installing project dependencies (npm install)..."
echo "This may take a minute..."
echo

echo "-- Installing Root dependencies..."
npm install --no-fund --no-audit

echo "-- Installing Backend dependencies..."
(cd backend && npm install --no-fund --no-audit)

echo "-- Installing Frontend dependencies..."
(cd frontend && npm install --no-fund --no-audit)

echo
echo "[4/4] Finalizing configuration..."
echo

# 4. Set execution permissions for the launch script
chmod +x launch_mac.sh &> /dev/null

echo "============================================================"
echo "  SETUP COMPLETED SUCCESSFULLY! 🚀"
echo "============================================================"
echo
echo "You can now use './launch_mac.sh' to start the system."
echo
