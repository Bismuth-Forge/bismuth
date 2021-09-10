#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
# 
# SPDX-License-Identifier: MIT

set -e

# Install icons
APP_ICONS_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/icons/hicolor/scalable/apps"
mkdir -p "$APP_ICONS_DIR"
cp -v res/icons/bismuth.svg "$APP_ICONS_DIR/bismuth.svg"

# Display info and upgrade/install script
KWINPKG_FILE="${npm_package_config_build_dir:-build}/${npm_package_name:=Bismuth}-${npm_package_version:-1.0}.kwinscript"
plasmapkg2 -u "$KWINPKG_FILE" || plasmapkg2 -i "$KWINPKG_FILE"
plasmapkg2 -t kwinscript -s "$npm_package_name"

