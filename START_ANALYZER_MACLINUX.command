#!/bin/bash

# Music Analyzer - Studio Quality Checker Unified Start Script
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

echo "============================================================"
echo "  MUSIC ANALYZER - UNIFIED STARTUP (macOS)"
echo "============================================================"
echo

# 1. Verification of Environment
# Function to update path to include local node
update_local_path() {
    if [ -d "$DIR/bin/node/bin" ]; then
        export PATH="$DIR/bin/node/bin:$PATH"
    fi
}

update_local_path

# 1. Setup Environment PATH
# This ensures we use the portable Node.js if it exists
if [ -d "$DIR/bin/node/bin" ]; then
    export PATH="$DIR/bin/node/bin:$PATH"
fi

# Export local node_modules/.bin paths for sub-process resolution
export PATH="$DIR/node_modules/.bin:$DIR/backend/node_modules/.bin:$DIR/frontend/node_modules/.bin:$PATH"

# 2. Check for node_modules to see if we need setup
if [ ! -d "$DIR/node_modules" ] || [ ! -d "$DIR/frontend/node_modules" ] || [ ! -d "$DIR/backend/node_modules" ]; then
    echo "[INFO] First time setup or missing files detected..."
    bash "$DIR/scripts/setup_mac.sh"
    if [ $? -ne 0 ]; then
        echo "[ERROR] Setup failed. Please check the errors above."
        exit 1
    fi
fi

# 3. Final Verification
echo "Environment verified successfully! 🚀"
echo ""

# 4. Start the Application
echo "Starting analysis engine and user interface..."
echo ""

# Use the absolute path to npm to ensure we use the correct one
NPM_BIN="npm"
if [ -f "$DIR/bin/node/bin/npm" ]; then
    NPM_BIN="$DIR/bin/node/bin/npm"
fi

# Launch browser in background (wait 5 sec for server)
echo "Opening browser..."
(sleep 5 && open http://localhost:5173) &

"$NPM_BIN" start

if [ $? -ne 0 ]; then
    echo ""
    echo "[ERROR] Failed to start Music Analyzer."
    echo "Please ensure Node.js is installed. Try running scripts/setup_mac.sh manually if this persists."
    exit 1
fi
