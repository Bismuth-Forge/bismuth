#!/usr/bin/env sh
set -e

KWINPKG_FILE="${npm_package_name}-${npm_package_version}.kwinscript"

# Remove old archive
rm -f "$KWINPKG_FILE"

# Create new installable package
7z a -tzip "$KWINPKG_FILE" ./$npm_package_config_build_dir/contents/ ./$npm_package_config_build_dir/metadata.desktop
