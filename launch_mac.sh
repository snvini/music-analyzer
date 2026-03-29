#!/bin/bash

# Music Analyzer - Studio Quality Checker Launch Script
echo "============================================================"
echo "  MUSIC ANALYZER - STUDIO QUALITY CHECKER"
echo "============================================================"
echo

# 1. Setup Verification
if [ ! -d "node_modules" ] || [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo "[WARNING] Project dependencies are missing. Running setup script..."
    echo
    bash setup_mac.sh
    if [ $? -ne 0 ]; then
        echo "[ERROR] Setup failed. Please run setup manually."
        exit 1
    fi
fi

# 2. Launching Everything
echo "Environment verified successfully! 🚀"
echo
echo "Starting analysis engine and user interface..."
echo

# Using root package.json to run concurrently
npm start

if [ $? -ne 0 ]; then
    echo
    echo "[ERROR] Failed to start Music Analyzer."
    echo "Please ensure Node.js is installed and try running 'setup.sh' again."
    exit 1
fi
