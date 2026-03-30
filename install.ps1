# ==============================================================================
# MUSIC ANALYZER - QUICK INSTALLER (Windows PowerShell)
# ==============================================================================

# --- CONFIGURAÇÕES / SETTINGS ---
$REPO_URL = "https://github.com/snvini/music-analyzer/archive/refs/heads/main.zip"
$FOLDER_NAME = "Music-Analyzer"
$ZIP_FILE = "music_temp.zip"
$GITHUB_FOLDER_NAME = "music-analyzer-main"

# 1. Definir o local de instalação (Mesa/Desktop)
$INSTALL_DIR = "$HOME\Desktop"
Set-Location $INSTALL_DIR

Write-Host "---------------------------------------------------" -ForegroundColor Cyan
Write-Host "🚀 [PT] Iniciando instalação de $FOLDER_NAME..."
Write-Host "🚀 [EN] Starting $FOLDER_NAME installation..."
Write-Host "---------------------------------------------------" -ForegroundColor Cyan

# 2. Baixar o projeto sem acionar a Quarentena (Bypass browser quarantine)
Write-Host "📥 [1/4] [PT] Baixando arquivos... / [EN] Downloading files..." -ForegroundColor Yellow
Invoke-WebRequest -Uri $REPO_URL -OutFile $ZIP_FILE

# 3. Extrair sem dependências extras
Write-Host "📦 [2/4] [PT] Extraindo projeto... / [EN] Extracting project..." -ForegroundColor Yellow
Expand-Archive -Path $ZIP_FILE -DestinationPath "." -Force

if (Test-Path $GITHUB_FOLDER_NAME) {
    # Se já existir uma instalação anterior, remove para garantir atualização limpa
    if (Test-Path $FOLDER_NAME) { 
        Remove-Item -Recurse -Force $FOLDER_NAME 
    }
    Rename-Item -Path $GITHUB_FOLDER_NAME -NewName $FOLDER_NAME
}

# Limpeza
Remove-Item $ZIP_FILE -Force

# 4. Feedback visual de sucesso
Write-Host "✅ [3/4] [PT] Instalação concluída! / [EN] Installation finished!" -ForegroundColor Green
Write-Host "---------------------------------------------------"
Write-Host "📂 [PT] Salvo em: $INSTALL_DIR\$FOLDER_NAME"
Write-Host "📂 [EN] Saved at: $INSTALL_DIR\$FOLDER_NAME"
Write-Host "💡 [PT] Para começar, execute: START_ANALYZER_WINDOWS.bat"
Write-Host "💡 [EN] To start, run: START_ANALYZER_WINDOWS.bat"
Write-Host "---------------------------------------------------"
