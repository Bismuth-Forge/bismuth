#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
# SPDX-License-Identifier: MIT

set -e

echo "📦 Installing the KWin Script..."
KWINPKG_FILE="bismuth.kwinscript"
plasmapkg2 -u "$KWINPKG_FILE" > /dev/null || plasmapkg2 -i "$KWINPKG_FILE" > /dev/null

