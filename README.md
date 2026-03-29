# 🎵 Music Analyzer - Studio Quality Checker

### 🌐 Official Website: [music-analyzer.pages.dev](https://music-analyzer.pages.dev/)

> [!CAUTION]
> **SEGURANÇA EM PRIMEIRO LUGAR**: Baixe o Music Analyzer **APENAS** através do repositório oficial no GitHub (`snvini/music-analyzer`). Este projeto é **Código Aberto**, seguro e transparente. Versões baixadas de outras fontes podem conter scripts maliciosos que podem danificar seus arquivos ou seu computador.
> 
> **SAFETY FIRST**: Only download Music Analyzer from the official GitHub repository (`snvini/music-analyzer`). This project is **Open Source**, safe, and transparent. Versions from third-party sources may contain malware or scripts that could harm your files.

---

A high-fidelity, professional-grade audio toolkit designed for DJs to recursively scan music libraries, verify spectral integrity, and identify "inflated" audio files (fake high-quality rips). Now bundled with **Zero-Configuration** for both Windows and Mac.

---

## 🚀 Quick Start (Recommended)

This project is designed for **Zero-Configuration**. You don't need to open the terminal or install things manually.

### Windows 🪟
1.  Download or Clone the repository.
2.  Double-click **`START_ANALYZER_WINDOWS.bat`** (**Executar como Administrador** / **Run as Administrator**).
3.  Wait for the first-time setup to complete. The app will open automatically in your browser.

### macOS 🍎
1.  Download or Clone the repository.
2.  Double-click **`START_ANALYZER_MAC.command`**.
3.  If you see an error about **"Access Privileges"** or **"Permission Denied"**:
    - Right-click the file and select **Open**. 
    - OR follow the [Fix Permissions](#-mac-troubleshooting) guide below.

> [!TIP]
> **MAC TIP (Zero Terminal)**: The easiest way to avoid permission issues on Mac is to download the project using [GitHub Desktop](https://desktop.github.com/). It handles all file permissions automatically, so you can just double-click to start!

---

## ⚠️ Mac Troubleshooting
If macOS says the file "could not be executed because you do not have appropriate access privileges", follow these 10-second steps:

1.  Open your **Terminal** (press `Command + Space` and search for "Terminal").
2.  Type exactly this: `chmod +x ` (**Note: leave a space after the +x**).
3.  **Drag and Drop** the file `START_ANALYZER_MAC.command` into the terminal window.
4.  Press **Enter**. 
5.  Now you can double-click the file normally! 🎉

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