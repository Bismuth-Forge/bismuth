#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
# 
# SPDX-License-Identifier: MIT

set -e

KWINPKG_NAME="bismuth.kwinscript"
FINAL_ARCHIVE_NAME="bismuth.tar.gz"

# Temporary change directory for archive tools
cd "./${npm_package_config_build_dir:-build}/script"

# Remove old packages
rm -f "$KWINPKG_NAME"

# Create new .kwinscript package
zip -qr "$KWINPKG_NAME" ./contents/ ./metadata.desktop

# Get back to the original directory
cd - > /dev/null

# Create subdir for final package
mkdir -p "./${npm_package_config_build_dir:-build}/package"
cd "./${npm_package_config_build_dir:-build}/package"

# Copy necessary files for package
cp -v "../script/$KWINPKG_NAME" "$KWINPKG_NAME"
cp -v "../../res/install.sh" install.sh
mkdir -p icons/ && cp -v "../../res/icons/bismuth.svg" icons/bismuth.svg

# Create installation archive for the end user
tar -czf "$FINAL_ARCHIVE_NAME" \
  "$KWINPKG_NAME" \
  install.sh \
  icons/bismuth.svg

# Get back to the original directory
cd - > /dev/null
