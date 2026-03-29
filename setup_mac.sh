#!/bin/bash

# Music Analyzer - macOS / Linux Setup Wizard
echo "============================================================"
echo "  MUSIC ANALYZER - STUDIO QUALITY CHECKER SETUP (UNIX)"
echo "============================================================"
echo

# 1. Check for Node.js
echo "[1/4] Verifying Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js not found. Please install from: https://nodejs.org/"
    exit 1
fi
echo "[OK] Node.js detected: $(node -v)"
echo

# 2. Check for FFmpeg
echo "[2/4] Verifying FFmpeg (Required for audio analysis)..."
if ! command -v ffmpeg &> /dev/null; then
    echo "[WARNING] FFmpeg not found in your PATH."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "It looks like you are on macOS. You can install it via Homebrew:"
        echo "brew install ffmpeg"
    else
        echo "Please install FFmpeg via your package manager (e.g., sudo apt install ffmpeg)."
    fi
    echo "The system will not function correctly without FFmpeg."
else
    echo "[OK] FFmpeg detected."
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
