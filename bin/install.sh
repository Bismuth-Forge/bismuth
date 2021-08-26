#!/usr/bin/env sh
set -e

# Display info and upgrade/install script
KWINPKG_FILE="${npm_package_name}-${npm_package_version}.kwinscript"
plasmapkg2 -t kwinscript -s $npm_package_name && plasmapkg2 -u "$KWINPKG_FILE" || plasmapkg2 -i "$KWINPKG_FILE"

