#!/bin/bash

# Music Analyzer - Studio Quality Checker Unified Start Script
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "============================================================"
echo "  MUSIC ANALYZER - UNIFIED STARTUP (macOS)"
echo "============================================================"
echo

# 1. Verification of Environment
if [ ! -d "node_modules" ] || [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo "[INFO] First time setup or missing files detected..."
    echo
    chmod +x "$DIR/scripts/setup_mac.sh" &> /dev/null
    bash "$DIR/scripts/setup_mac.sh"
    if [ $? -ne 0 ]; then
        echo "[ERROR] Setup failed. Please check your internet and try again."
        exit 1
    fi
fi

# 2. Launching Everything
echo "Environment verified successfully! 🚀"
echo
echo "Starting analysis engine and user interface..."
echo

# Launch browser in background (wait 5 sec for server)
echo "Opening browser..."
(sleep 5 && open http://localhost:5173) &

# Start the system
npm start

if [ $? -ne 0 ]; then
    echo
    echo "[ERROR] Failed to start Music Analyzer."
    echo "Please ensure Node.js is installed. Try running scripts/setup_mac.sh manually if this persists."
    exit 1
fi
