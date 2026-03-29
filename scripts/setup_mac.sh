#!/bin/bash

# Music Analyzer - macOS / Linux Setup Wizard
# Get script and root directories
SCRIPTS_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPTS_DIR/.."
ROOT_DIR="$(pwd)"

echo "============================================================"
echo "  MUSIC ANALYZER - STUDIO QUALITY CHECKER SETUP (UNIX)"
echo "============================================================"
echo

# 1. Check for Node.js
echo "[1/4] Verifying Node.js installation..."
NODE_BINARY="node"
if ! command -v node &> /dev/null; then
    if [ -f "$ROOT_DIR/bin/node_v22/bin/node" ]; then
        NODE_BINARY="$ROOT_DIR/bin/node_v22/bin/node"
        echo "[OK] Portable Node.js found locally."
    else
        echo "[INFO] Node.js not found in system."
        echo "We will now download a portable version to run the analyzer automatically..."
        
        # Detect Architecture
        echo "Downloading portable version for macOS..."
        
        mkdir -p "$ROOT_DIR/bin"
        # Determine architecture
        ARCH=$(uname -m)
        NODE_URL="https://nodejs.org/dist/v22.13.1/node-v22.13.1-darwin-x64.tar.gz"
        if [ "$ARCH" = "arm64" ]; then
            NODE_URL="https://nodejs.org/dist/v22.13.1/node-v22.13.1-darwin-arm64.tar.gz"
        fi

        curl -L --progress-bar "$NODE_URL" -o "$ROOT_DIR/bin/node.tar.gz"
        
        echo "Extracting Node.js..."
        # Force cleanup of any partial install
        rm -rf "$ROOT_DIR/bin/node_v22"
        mkdir -p "$ROOT_DIR/bin/node_tmp"
        tar -xzf "$ROOT_DIR/bin/node.tar.gz" -C "$ROOT_DIR/bin/node_tmp" --strip-components=1
        mv "$ROOT_DIR/bin/node_tmp" "$ROOT_DIR/bin/node_v22"
        rm "$ROOT_DIR/bin/node.tar.gz"
        
        NODE_BINARY="$ROOT_DIR/bin/node_v22/bin/node"
    fi
fi

# Double check if binary exists now
if [ ! -f "$NODE_BINARY" ] && [ "$NODE_BINARY" != "node" ]; then
    echo "[ERROR] Failed to set up portable Node.js"
    exit 1
fi

echo "[OK] Node.js ready: $NODE_BINARY"

# 2. Check for FFmpeg
echo "[2/4] Verifying FFmpeg..."
# Check system PATH first, then project bin folder
FFMPEG_BINARY="ffmpeg"
if ! command -v ffmpeg &> /dev/null; then
    if [ -f "$ROOT_DIR/bin/ffmpeg/ffmpeg" ]; then
        FFMPEG_BINARY="$ROOT_DIR/bin/ffmpeg/ffmpeg"
    else
        echo "FFmpeg not found. Downloading portable version..."
        mkdir -p "$ROOT_DIR/bin"
        # Download static build from evermeet.cx (standard for macOS)
        curl -L --progress-bar "https://evermeet.cx/ffmpeg/getrelease/zip" -o "$ROOT_DIR/bin/ffmpeg.zip"
        echo "Extracting FFmpeg..."
        unzip -o "$ROOT_DIR/bin/ffmpeg.zip" -d "$ROOT_DIR/bin/"
        rm "$ROOT_DIR/bin/ffmpeg.zip"
        # Some zips might extract as a single file, others in a folder. We'll handle both.
        if [ -f "$ROOT_DIR/bin/ffmpeg" ]; then
             mkdir -p "$ROOT_DIR/bin/ffmpeg_folder"
             mv "$ROOT_DIR/bin/ffmpeg" "$ROOT_DIR/bin/ffmpeg_folder/ffmpeg"
             # Also try to get ffprobe which is in a separate zip usually
             curl -L "https://evermeet.cx/ffprobe/getrelease/zip" -o "$ROOT_DIR/bin/ffprobe.zip"
             unzip -o "$ROOT_DIR/bin/ffprobe.zip" -d "$ROOT_DIR/bin/ffmpeg_folder/"
             rm "$ROOT_DIR/bin/ffprobe.zip"
             mv "$ROOT_DIR/bin/ffmpeg_folder" "$ROOT_DIR/bin/ffmpeg"
        fi
        FFMPEG_BINARY="$ROOT_DIR/bin/ffmpeg/ffmpeg"
    fi
fi
echo "[OK] FFmpeg ready."

# 3. Install dependencies
echo
echo "[3/4] Installing dependencies... (This may take a few minutes)"
"$NODE_BINARY" -v

# Detect if we should use local npm or system npm
if [ "$NODE_BINARY" = "node" ]; then
    NPM_CMD="npm"
else
    NPM_CMD="$ROOT_DIR/bin/node_v22/bin/npm"
fi

# Root dependencies
"$NPM_CMD" install

# Backend dependencies
echo "Installing backend dependencies..."
cd "$ROOT_DIR/backend" && "$NPM_CMD" install

# Frontend dependencies
echo "Installing frontend dependencies..."
cd "$ROOT_DIR/frontend" && "$NPM_CMD" install

cd "$ROOT_DIR"
# 4. Set execution permissions for the launch script
chmod +x launch_mac.sh &> /dev/null

echo "============================================================"
echo "  SETUP COMPLETED SUCCESSFULLY! 🚀"
echo "============================================================"
echo
echo "You can now use './launch_mac.sh' to start the system."
echo
