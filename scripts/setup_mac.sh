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
echo "[1/4] Verifying Node.js environment..."
echo "[INFO] Forcing isolated portable Node.js for maximum stability..."

# Determine OS and Architecture
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)
NODE_VER="v22.13.1"
EXT="tar.gz"

if [ "$OS" = "darwin" ]; then
    PLATFORM="darwin"
    if [ "$ARCH" = "arm64" ]; then ARCH_SUFFIX="arm64"; else ARCH_SUFFIX="x64"; fi
elif [ "$OS" = "linux" ]; then
    PLATFORM="linux"
    EXT="tar.xz"
    if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then ARCH_SUFFIX="arm64"; else ARCH_SUFFIX="x64"; fi
else
    echo "[ERROR] Unsupported OS: $OS"
    exit 1
fi

NODE_URL="https://nodejs.org/dist/$NODE_VER/node-$NODE_VER-$PLATFORM-$ARCH_SUFFIX.$EXT"

if [ ! -f "$ROOT_DIR/bin/node_v22/bin/node" ]; then
    echo "Downloading portable Node.js for $OS ($ARCH_SUFFIX)..."
    mkdir -p "$ROOT_DIR/bin"
    curl -L --progress-bar "$NODE_URL" -o "$ROOT_DIR/bin/node.$EXT"
    
    echo "Extracting Node.js..."
    rm -rf "$ROOT_DIR/bin/node_v22"
    mkdir -p "$ROOT_DIR/bin/node_tmp"
    tar -xf "$ROOT_DIR/bin/node.$EXT" -C "$ROOT_DIR/bin/node_tmp" --strip-components=1
    mv "$ROOT_DIR/bin/node_tmp" "$ROOT_DIR/bin/node_v22"
    rm "$ROOT_DIR/bin/node.$EXT"
fi

NODE_BINARY="$ROOT_DIR/bin/node_v22/bin/node"

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
        echo "FFmpeg not found. Downloading Mini-Portable version (~20MB)..."
        mkdir -p "$ROOT_DIR/bin"
        
        # Using Direct Download URLs from GitHub Releases (Reliable & Fast)
        # Download FFmpeg
        echo "[1/2] Downloading FFmpeg (Analysis Engine)..."
        curl -L --progress-bar "https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v6.1/ffmpeg-6.1-macos-64.zip" -o "$ROOT_DIR/bin/ffmpeg.zip"
        # Download FFprobe
        echo "[2/2] Downloading FFprobe (Metadata Scanner)..."
        curl -L --progress-bar "https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v6.1/ffprobe-6.1-macos-64.zip" -o "$ROOT_DIR/bin/ffprobe.zip"
        
        echo "Extracting FFmpeg & FFprobe..."
        mkdir -p "$ROOT_DIR/bin/ffmpeg"
        unzip -o "$ROOT_DIR/bin/ffmpeg.zip" -d "$ROOT_DIR/bin/ffmpeg/"
        unzip -o "$ROOT_DIR/bin/ffprobe.zip" -d "$ROOT_DIR/bin/ffmpeg/"
        
        # Add execution permissions
        chmod +x "$ROOT_DIR/bin/ffmpeg/ffmpeg"
        chmod +x "$ROOT_DIR/bin/ffmpeg/ffprobe"
        
        rm "$ROOT_DIR/bin/ffmpeg.zip"
        rm "$ROOT_DIR/bin/ffprobe.zip"
        
        FFMPEG_BINARY="$ROOT_DIR/bin/ffmpeg/ffmpeg"
    fi
fi
echo "[OK] FFmpeg ready."

# 3. Install dependencies
echo
echo "[3/4] Installing dependencies... (This may take a few minutes)"
echo "[INFO] Ensuring a fresh installation for consistency..."
rm -rf "$ROOT_DIR/node_modules"
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
