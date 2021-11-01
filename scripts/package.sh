#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
# SPDX-License-Identifier: MIT

set -e


echo "Packaging KWin Script..."

KWINPKG_NAME="bismuth.kwinscript"
FINAL_ARCHIVE_NAME="bismuth.tar.gz"

# Temporary change directory for archive tools
cd "./build/kwinscript"

# Remove old packages
rm -f "$KWINPKG_NAME"

# Create new .kwinscript package
zip -qr "$KWINPKG_NAME" ./contents/ ./metadata.desktop

# Get back to the original directory
cd - > /dev/null

# TODO: Packaging for KCM

