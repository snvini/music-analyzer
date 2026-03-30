# ==============================================================================
# MUSIC ANALYZER - QUICK INSTALLER (Windows PowerShell)
# ==============================================================================

# Força UTF-8 para evitar caracteres estranhos (????)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# --- CONFIGURAÇÕES / SETTINGS ---
$REPO_URL = "https://github.com/snvini/music-analyzer/archive/refs/heads/main.zip"
$FOLDER_NAME = "Music-Analyzer"
$ZIP_FILE = "music_temp.zip"
$GITHUB_FOLDER_NAME = "music-analyzer-main"

# 1. Definir o local de instalação de forma DINÂMICA (Desktop/Área de Trabalho/etc)
# Busca a pasta oficial de Desktop do sistema
$INSTALL_DIR = [Environment]::GetFolderPath("Desktop")

# Se falhar (raro), busca no registro do Windows (User Shell Folders)
if (-not $INSTALL_DIR) {
    try {
        $INSTALL_DIR = (Get-ItemProperty -Path "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" -ErrorAction SilentlyContinue).Desktop
    } catch {}
}

# Expandir variáveis de ambiente caso o registro retorne algo como %USERPROFILE%\Desktop
if ($INSTALL_DIR) {
    $INSTALL_DIR = [System.Environment]::ExpandEnvironmentVariables($INSTALL_DIR)
} else {
    # Fallback final se nada funcionar: pasta do usuário
    $INSTALL_DIR = Join-Path $HOME "Desktop"
}

# Tenta entrar na pasta. Se não conseguir, cancela para não instalar na pasta errada (/vsoar)
if (-not (Test-Path $INSTALL_DIR)) {
    Write-Host "[ERROR] ERRO: Não foi possível localizar sua Área de Trabalho / Desktop folder not found." -ForegroundColor Red
    Write-Host "Caminho tentado / Attempted path: $INSTALL_DIR"
    exit 1
}

Set-Location -Path $INSTALL_DIR -ErrorAction Stop

Write-Host "---------------------------------------------------" -ForegroundColor Cyan
Write-Host "[INFO] [PT] Iniciando instalação de $FOLDER_NAME..."
Write-Host "[INFO] [EN] Starting $FOLDER_NAME installation..."
Write-Host "---------------------------------------------------" -ForegroundColor Cyan

# 2. Baixar o projeto sem acionar a Quarentena (Bypass browser quarantine)
Write-Host "[1/4] [PT] Baixando arquivos... / [EN] Downloading files..." -ForegroundColor Yellow
Invoke-WebRequest -Uri $REPO_URL -OutFile $ZIP_FILE

# 3. Extrair sem dependências extras
Write-Host "[2/4] [PT] Extraindo projeto... / [EN] Extracting project..." -ForegroundColor Yellow
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
Write-Host "`n[OK] [3/4] [PT] Instalação concluída! / [EN] Installation finished!" -ForegroundColor Green
Write-Host "---------------------------------------------------"
Write-Host "[FOLDER] [PT] Salvo em: $INSTALL_DIR\$FOLDER_NAME"
Write-Host "[FOLDER] [EN] Saved at: $INSTALL_DIR\$FOLDER_NAME"
Write-Host "[INFO] [PT] Para começar, entre na pasta e execute: START_ANALYZER_WINDOWS.bat"
Write-Host "[INFO] [EN] To start, enter the folder and run: START_ANALYZER_WINDOWS.bat"
Write-Host "---------------------------------------------------"

# Tenta abrir a pasta automaticamente para facilitar a vida do usuário
try {
    explorer.exe "$INSTALL_DIR\$FOLDER_NAME"
} catch {}

Write-Host "`n[INFO] [PT] O sistema abrirá o instalador completo na primeira execução." -ForegroundColor Cyan
Write-Host "[INFO] [EN] The system will open the full installer on first run." -ForegroundColor Cyan
timeout /t 10
