#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
# SPDX-License-Identifier: MIT

set -e

echo "📦 Installing the KWin Script..."

KWINSCRIPT_BUILDDIR="build/kwinscript"
KWINPKG_FILE="bismuth.kwinscript"

plasmapkg2 -u "$KWINSCRIPT_BUILDDIR/$KWINPKG_FILE" > /dev/null || plasmapkg2 -i "$KWINSCRIPT_BUILDDIR/$KWINPKG_FILE" > /dev/null

echo "📦 Installing the KCM..."

KCM_BUILDDIR="build/kcm"
sudo cmake --install "$KCM_BUILDDIR"

echo "🎉 Installation finished."
echo "💡 You can configure Bismuth in the System Settings > Window Management > Window Tiling."
echo "🦾 Enjoy your tiling!"
