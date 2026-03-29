# Music Analyzer HUD 🎛️
**BY DJ VINIISH**

A high-fidelity, professional-grade audio toolkit designed for DJs to recursively scan music libraries, verify spectral integrity, and identify "inflated" audio files (fake high-quality rips).

---

## 🚀 Quick Zero-Configuration Start
The easiest way to get started is to use our **Automated Setup** scripts. They are designed to handle dependency installation and environment configuration for you.

### Windows Users
1.  **Run Setup**: Double-click `setup_windows.bat`. It will attempt to install Node.js, FFmpeg, and Python if they are missing.
2.  **Launch**: Once finished, double-click `launch_windows.bat` to start the HUD.

### macOS & Linux Users
1.  **Permissions**: Run `chmod +x setup_mac.sh launch_mac.sh` in your terminal.
2.  **Run Setup**: Execute `./setup_mac.sh`. It will guide you through installing the necessary tools.
3.  **Launch**: Execute `./launch_mac.sh` to start the HUD.

---

## 🛠️ Prerequisites & Automatic Setup
The system requires three core engines to perform spectral audits. Our `setup` script handles these automatically, but you can also install them manually:

1.  **Node.js**: The brain of the HUD.
2.  **FFmpeg**: The specialized audio engine for spectral analytics.
3.  **Python 3.x**: Required for advanced frequency recognition scripts.

> [!NOTE]
> If the setup script fails to find a tool, you can install them manually:
> `winget install Gyan.FFmpeg` (Windows) or `brew install ffmpeg` (macOS).

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