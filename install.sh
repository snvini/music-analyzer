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
# Tenta pegar via AppleScript (mais preciso no Mac) ou fallback para ~/Desktop
if [[ "$OSTYPE" == "darwin"* ]]; then
    INSTALL_DIR=$(osascript -e 'POSIX path of (path to desktop folder)' 2>/dev/null || echo "$HOME/Desktop")
else
    # Fallback para Linux ou se osascript falhar
    INSTALL_DIR="$HOME/Desktop"
fi

cd "$INSTALL_DIR" || exit

echo "---------------------------------------------------"
echo "🚀 [PT] Iniciando instalação de $FOLDER_NAME..."
echo "🚀 [EN] Starting $FOLDER_NAME installation..."
echo "---------------------------------------------------"

# 2. Baixar o projeto sem acionar a Quarentena
# O curl nativo do macOS não aplica a flag 'com.apple.quarantine'
echo "📥 [1/4] [PT] Baixando arquivos... / [EN] Downloading files..."
curl -sSL "$REPO_URL" -o "$ZIP_FILE"

if [ $? -ne 0 ]; then
    echo "❌ [PT] Erro no download. / [EN] Download error."
    exit 1
fi

# 3. Extrair sem dependências extras
echo "📦 [2/4] [PT] Extraindo projeto... / [EN] Extracting project..."
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
echo "🔑 [3/4] [PT] Configurando permissões... / [EN] Setting permissions..."
cd "$FOLDER_NAME" || exit

# Aplica permissão em todos os scripts .sh e .command recursivamente
find . -name "*.sh" -exec chmod +x {} +
find . -name "*.command" -exec chmod +x {} +

# 6. Feedback visual de sucesso
echo "✅ [4/4] [PT] Instalação concluída! / [EN] Installation finished!"
echo "---------------------------------------------------"
echo "📂 [PT] Salvo em: $INSTALL_DIR/$FOLDER_NAME"
echo "📂 [EN] Saved at: $INSTALL_DIR/$FOLDER_NAME"
echo "💡 [PT] Para começar, execute: START_ANALYZER_MACLINUX.command"
echo "💡 [EN] To start, run: START_ANALYZER_MACLINUX.command"
echo "---------------------------------------------------"
