# Music Analyzer HUD 🎛️
### BY DJ VINIISH

A high-fidelity, professional-grade audio toolkit designed for DJs to recursively scan music libraries, verify spectral integrity, and identify "inflated" audio files (fake high-quality rips).

---

## 🎧 The Vision
In a world of low-quality rips disguised as high-bitrate files, metadata can lie. This tool performs a **Spectral Audit** of your entire collection, ensuring that what you play in the booth is true studio quality.

## 🚀 Key Features
- **Inflated Bitrate Detection**: Advanced algorithms hunt for frequency cutoffs that reveal 128kbps rips upscaled to WAV/FLAC.
- **HD Spectral Visuals**: Generate and audit high-definition spectrograms instantly within a HUD-style interface.
- **Lightning Fast Workflow**: Recursive folder scanning with real-time HUD progress updates.
- **Secure Handling**: A non-destructive "Move to Trash" workflow for failed tracks.
- **100% Local & Open Source**: No cloud, no uploads. Your music and your privacy are protected.

---

## 🛠️ Prerequisites
Before initializing, ensure you have the following installed. These are mandatory for the spectral engine:

1.  **Node.js (v22.x or later)**: [Download here](https://nodejs.org/)
2.  **FFmpeg**: Required for audio analysis.
    - **Windows**: `winget install Gyan.FFmpeg`
    - **macOS**: `brew install ffmpeg`
    - **Linux**: `sudo apt install ffmpeg`
3.  **Python 3.x**: Required for specific spectral processing scripts.

---

## ⚒️ Installation & Launch

### Windows Users
1.  **Run Setup**: Double-click `setup_windows.bat` to install all dependencies and set up the environment.
2.  **Launch**: Double-click `launch_windows.bat` to start the HUD.

### macOS & Linux Users
1.  **Permissions**: Run `chmod +x setup_mac.sh launch_mac.sh` in your terminal.
2.  **Run Setup**: Execute `./setup_mac.sh` to install dependencies.
3.  **Launch**: Execute `./launch_mac.sh` to start the HUD.

---

## 🛡️ Security & Transparency
This project was built out of a personal need for library security. Being **Open Source** allows any DJ or developer to audit the code, ensuring that your data remains safe and your music is never compromised by hidden "black-box" logic.

## 🤝 Support & Credit
Built with **Love for DJing**.
Developed by **[DJ Viniish](https://www.instagram.com/viniishdj/)**.

---
*For the Art of DJing.*
