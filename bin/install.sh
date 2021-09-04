#!/usr/bin/env sh
set -e

# Install icons
APP_ICONS_DIR="${XDG_DATA_HOME:-$HOME/.local/share}/icons/hicolor/scalable/apps"
mkdir -p "$APP_ICONS_DIR"
cp -v res/icons/bismuth.svg "$APP_ICONS_DIR/bismuth.svg"

# Display info and upgrade/install script
KWINPKG_FILE="$npm_package_config_build_dir/${npm_package_name}-${npm_package_version}.kwinscript"
plasmapkg2 -t kwinscript -s $npm_package_name && plasmapkg2 -u "$KWINPKG_FILE" || plasmapkg2 -i "$KWINPKG_FILE"

