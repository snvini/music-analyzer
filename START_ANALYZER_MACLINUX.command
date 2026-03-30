#!/bin/bash

# Music Analyzer - Studio Quality Checker Unified Start Script
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "============================================================"
echo "  MUSIC ANALYZER - UNIFIED STARTUP (macOS)"
echo "============================================================"
echo

verify_and_start() {
    # 1. Setup Environment PATH
    # We ALWAYS prioritize the portable Node for the studio environment
    if [ ! -d "$DIR/bin/node_v22/bin" ]; then
        echo "[INFO] Portable environment not found. Forcing setup..."
        bash "$DIR/scripts/setup_mac.sh"
        if [ $? -ne 0 ]; then
            echo "[ERROR] Setup failed. Please check the errors above."
            exit 1
        fi
    fi

    # Ensuring portable Node is in PATH
    export PATH="$DIR/bin/node_v22/bin:$PATH"

    # Export local node_modules/.bin paths for sub-process resolution
    export PATH="$DIR/node_modules/.bin:$DIR/backend/node_modules/.bin:$DIR/frontend/node_modules/.bin:$PATH"

    # 2. Check for node_modules to see if we need setup
    if [ ! -d "$DIR/node_modules" ] || [ ! -d "$DIR/frontend/node_modules" ] || [ ! -d "$DIR/backend/node_modules" ]; then
        echo "[INFO] Dependencies missing. Running setup..."
        bash "$DIR/scripts/setup_mac.sh"
        if [ $? -ne 0 ]; then
            echo "[ERROR] Setup failed."
            exit 1
        fi
    fi
}

verify_and_start

# 3. Final Verification
echo "Environment verified successfully!"
echo ""

# 4. Start the Application
echo "Starting analysis engine..."
echo ""

# Ensure we use portable npm if available
NPM_BIN="npm"
if [ -f "$DIR/bin/node_v22/bin/npm" ]; then
    NPM_BIN="$DIR/bin/node_v22/bin/npm"
fi

# Launch browser in background (wait 5 sec for server)
echo "Opening browser..."
(sleep 5 && open http://localhost:5173) &

# Run start command with absolute node if portable
if [ -f "$DIR/bin/node_v22/bin/node" ]; then
    "$DIR/bin/node_v22/bin/node" "$NPM_BIN" start
else
    "$NPM_BIN" start
fi

if [ $? -ne 0 ]; then
    echo ""
    echo "[ERROR] Failed to start Music Analyzer."
    echo "Please ensure Node.js is installed. Try running scripts/setup_mac.sh manually if this persists."
    exit 1
fi
