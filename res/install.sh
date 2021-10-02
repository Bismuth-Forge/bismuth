#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
# 
# SPDX-License-Identifier: MIT

# Installation script, that comes inside of the tar.gz package

set -e

# Install icons
echo "🖼️ Installing icons..."
APP_ICONS_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/icons/hicolor/scalable/apps"
mkdir -p "$APP_ICONS_DIR"
cp icons/bismuth.svg "$APP_ICONS_DIR/bismuth.svg"

# Upgrade/install script
echo "📦 Installing the script..."
KWINPKG_FILE="bismuth.kwinscript"
plasmapkg2 -u "$KWINPKG_FILE" > /dev/null || plasmapkg2 -i "$KWINPKG_FILE" > /dev/null

# Enable user configuration dialog
echo "🔧 Enabling user configuration..."
mkdir -p ~/.local/share/kservices5/
ln -sf ~/.local/share/kwin/scripts/bismuth/metadata.desktop ~/.local/share/kservices5/bismuth.desktop

