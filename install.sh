#!/bin/bash

# ==============================================================================
# MUSIC ANALYZER - QUICK INSTALLER (macOS / Linux)
# ==============================================================================

# --- CONFIGURAÇÕES / SETTINGS ---
REPO_URL="https://github.com/snvini/music-analyzer/archive/refs/heads/main.zip"
FOLDER_NAME="Music-Analyzer"
ZIP_FILE="music_temp.zip"
GITHUB_FOLDER_NAME="music-analyzer-main"

# 1. Definir o local de instalação de forma DINÂMICA (Desktop/Área de Trabalho/etc)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # No Mac, usa AppleScript para encontrar a pasta oficial (Lida com qualquer idioma)
    INSTALL_DIR=$(osascript -e 'POSIX path of (path to desktop folder)' 2>/dev/null || echo "$HOME/Desktop")
else
    # No Linux, tenta usar o xdg-user-dir para localizar o Desktop traduzido
    if command -v xdg-user-dir >/dev/null 2>&1; then
        INSTALL_DIR=$(xdg-user-dir DESKTOP)
    else
        INSTALL_DIR="$HOME/Desktop"
    fi
fi

# Tenta entrar na pasta. Se não existir, cancela para não poluir a Home
if [ ! -d "$INSTALL_DIR" ]; then
    echo "[ERROR] [PT] Erro: Pasta Desktop não encontrada em $INSTALL_DIR"
    echo "[ERROR] [EN] Error: Desktop folder not found at $INSTALL_DIR"
    exit 1
fi

cd "$INSTALL_DIR" || exit

echo "---------------------------------------------------"
echo "[INFO] [PT] Iniciando instalação de $FOLDER_NAME..."
echo "[INFO] [EN] Starting $FOLDER_NAME installation..."
echo "---------------------------------------------------"

# 2. Baixar o projeto sem acionar a Quarentena
# O curl nativo do macOS não aplica a flag 'com.apple.quarantine'
echo "[1/4] [PT] Baixando arquivos... / [EN] Downloading files..."
curl -sSL "$REPO_URL" -o "$ZIP_FILE"

if [ $? -ne 0 ]; then
    echo "[ERROR] [PT] Erro no download. / [EN] Download error."
    exit 1
fi

# 3. Extrair sem dependências extras
echo "[2/4] [PT] Extraindo projeto... / [EN] Extracting project..."
unzip -q "$ZIP_FILE"

if [ -d "$GITHUB_FOLDER_NAME" ]; then
    # Se já existir uma instalação anterior, remove para garantir atualização limpa
    if [ -d "$FOLDER_NAME" ]; then
        rm -rf "$FOLDER_NAME"
    fi
    mv "$GITHUB_FOLDER_NAME" "$FOLDER_NAME"
fi

# Limpeza
rm -f "$ZIP_FILE"

# 4. Permissões de execução
echo "[3/4] [PT] Configurando permissões... / [EN] Setting permissions..."
cd "$FOLDER_NAME" || exit

# Aplica permissão em todos os scripts .sh e .command recursivamente
find . -name "*.sh" -exec chmod +x {} +
find . -name "*.command" -exec chmod +x {} +

# 6. Feedback visual de sucesso
echo "[OK] [4/4] [PT] Instalação concluída! / [EN] Installation finished!"
echo "---------------------------------------------------"
echo "[FOLDER] [PT] Salvo em: $INSTALL_DIR/$FOLDER_NAME"
echo "[FOLDER] [EN] Saved at: $INSTALL_DIR/$FOLDER_NAME"
echo "[INFO] [PT] Para começar, execute: START_ANALYZER_MACLINUX.command"
echo "[INFO] [EN] To start, run: START_ANALYZER_MACLINUX.command"
echo "---------------------------------------------------"
