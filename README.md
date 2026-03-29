# Music Analyzer HUD 🎛️
**BY DJ VINIISH**

A high-fidelity, professional-grade audio toolkit designed for DJs to recursively scan music libraries, verify spectral integrity, and identify "inflated" audio files (fake high-quality rips).

---

## 🚀 Quick Start (Recommended)

This project is designed for **Zero-Configuration**. You don't need to open the terminal or install things manually.

### Windows
1.  Download or Clone the repository.
2.  Double-click **`START_ANALYZER_WINDOWS.bat`**. 🪟
3.  Wait for the first-time setup to complete. The app will open automatically in your browser.

### macOS
1.  Download or Clone the repository.
2.  Double-click **`START_ANALYZER_MAC.command`**. 🍎
3.  If it asks for permissions, click "Open".
4.  Wait for the setup. The app will open in your browser.

---

## 🛠️ Prerequisites
The system will attempt to install these for you, but it's best to have them:
- **Node.js (LTS)**: [Download here](https://nodejs.org/)
- **FFmpeg**: The setup will download a portable version automatically.

> [!NOTE]
> **First Run**: The first time you open the app, it will download about 100MB of essential tools and dependencies. This only happens once!

---

## 📂 Folder Structure
- **`START_ANALYZER_WINDOWS.bat`**: Your main entry point for Windows.
- **`START_ANALYZER_MAC.command`**: Your main entry point for macOS.
- **`backend/`**: The analysis engine.
- **`frontend/`**: The user interface.
- **`scripts/`**: Internal setup scripts.
- **`bin/`**: Portable binaries (FFmpeg).
- **`trash/`**: Files you decide to move out of your collection.

---

## 🎧 The Vision
In a world of low-quality rips disguised as high-bitrate files, metadata can lie. This tool performs a **Spectral Audit** of your entire collection, ensuring that what you play in the booth is true studio quality.

## 📊 System Features
- **Inflated Bitrate Detection**: Advanced algorithms hunt for frequency caps that reveal 128kbps rips upscaled to WAV/FLAC.
- **HD Spectral Visuals**: Generate and audit high-definition spectrograms instantly within the HUD.
- **Lightning Fast Workflow**: Recursive folder scanning with real-time feedback.
- **Secure Handling**: A non-destructive "Move to Trash" workflow for failed tracks.
- **100% Local & Open Source**: No cloud, no uploads. Your music and your privacy are protected.

---

## 🛡️ Security & Transparency
Built out of personal necessity for library security. Being **Open Source** means you can audit every line of code, ensuring no hidden logic ever touches your music.

## 🤝 Support & Credit
Built with **Love for DJing** by **[DJ Viniish](https://www.instagram.com/viniishdj/)**.