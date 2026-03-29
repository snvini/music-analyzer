#!/bin/bash

# Music Analyzer - macOS / Linux Setup Wizard
cd "$(dirname "$0")"
DIR="$(dirname "$0")"
cd "$DIR"
echo "============================================================"
echo "  MUSIC ANALYZER - STUDIO QUALITY CHECKER SETUP (UNIX)"
echo "============================================================"
echo

# 1. Check for Node.js
echo "[1/4] Verifying Node.js installation..."
NODE_BINARY="node"
if ! command -v node &> /dev/null; then
    if [ -f "$DIR/bin/node/bin/node" ]; then
        NODE_BINARY="$DIR/bin/node/bin/node"
        echo "[OK] Portable Node.js found locally."
    else
        echo "[INFO] Node.js not found in system."
        echo "We will now download a portable version to run the analyzer automatically..."
        
        # Detect Architecture
        ARCH=$(uname -m)
        NODE_VERSION="v20.11.1"
        DIST_ARCH=""
        
        case $ARCH in
            x86_64) DIST_ARCH="darwin-x64" ;;
            arm64)  DIST_ARCH="darwin-arm64" ;;
            *)      echo "[ERROR] Unsupported architecture: $ARCH"; exit 1 ;;
        esac
        
        echo "Downloading Node.js $NODE_VERSION for $DIST_ARCH..."
        mkdir -p "$DIR/bin"
        curl -L -o "$DIR/bin/node.tar.gz" "https://nodejs.org/dist/$NODE_VERSION/node-$NODE_VERSION-$DIST_ARCH.tar.gz"
        
        if [ $? -ne 0 ]; then
            echo "[ERROR] Failed to download Node.js. Check your internet."
            exit 1
        fi
        
        echo "Extracting Node.js..."
        mkdir -p "$DIR/bin/node_tmp"
        tar -xzf "$DIR/bin/node.tar.gz" -C "$DIR/bin/node_tmp" --strip-components=1
        mv "$DIR/bin/node_tmp" "$DIR/bin/node"
        rm "$DIR/bin/node.tar.gz"
        
        NODE_BINARY="$DIR/bin/node/bin/node"
        echo "[OK] Portable Node.js installed to bin/node"
    fi
else
    echo "[OK] Node.js is already installed on the system."
fi

# Export local node to path for the rest of the script
export PATH="$DIR/bin/node/bin:$PATH"

# FFmpeg Section
if ! command -v ffmpeg &> /dev/null; then
    if [ -f "$DIR/bin/ffmpeg" ]; then
        echo "[OK] FFmpeg found in bin/ directory."
    else
        echo "FFmpeg not found. We'll download the static binary for the best experience..."
        mkdir -p "$DIR/bin"
        
        # Download FFmpeg
        echo "Downloading FFmpeg Static Binary for Mac (this may take a minute)..."
        curl -L -o ffmpeg.zip https://evermeet.cx/ffmpeg/get/zip
        unzip -o ffmpeg.zip -d "$DIR/bin/"
        rm ffmpeg.zip
        
        # Download FFprobe
        echo "Downloading FFprobe Static Binary for Mac..."
        curl -L -o ffprobe.zip https://evermeet.cx/ffprobe/get/zip
        unzip -o ffprobe.zip -d "$DIR/bin/"
        rm ffprobe.zip
        
        chmod +x "$DIR/bin/ffmpeg" "$DIR/bin/ffprobe"
        echo "[OK] Portable FFmpeg installed to bin/"
    fi
fi

echo
echo "[2/4] Installing dependencies... (This may take a few minutes)"
"$NODE_BINARY" -v
# Root dependencies
"$NODE_BINARY" "$(dirname "$NODE_BINARY")/npm" install

# Backend dependencies
echo "Installing backend dependencies..."
cd "$DIR/backend" && "$DIR/bin/node/bin/npm" install 2>/dev/null || npm install

# Frontend dependencies
echo "Installing frontend dependencies..."
cd "$DIR/frontend" && "$DIR/bin/node/bin/npm" install 2>/dev/null || npm install

cd "$DIR"
echo
echo "[3/4] Everything ready!"
echo "------------------------------------------------------------"
echo "  SETUP COMPLETE! You can now close this window."
echo "  Or just wait while we start the application..."
echo "------------------------------------------------------------"
sleep 2

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
