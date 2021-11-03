#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
# SPDX-License-Identifier: MIT

set -e


echo "🏗️ Building KWin Script..."

KWINSCRIPT_SOURCEDIR="src/kwinscript"
KWINSCRIPT_BUILDDIR="build/kwinscript"

# Make necessary directories
mkdir -p "$KWINSCRIPT_BUILDDIR/contents/code"

echo "👮 Checking using TS Compiler..."
npx tsc --noEmit --incremental

echo "🎁 Bundling using esbuild..."
npx esbuild \
  --bundle "$KWINSCRIPT_SOURCEDIR/index.ts" \
  --outfile="$KWINSCRIPT_BUILDDIR/contents/code/index.mjs" \
  --format=esm \
  --platform=neutral

# Copy resources to the build directory with correct paths
echo "📑 Preparing UI and metadata files..."
cp -r "$KWINSCRIPT_SOURCEDIR/ui" "$KWINSCRIPT_BUILDDIR/contents"

# Copy and update metadata
METADATA_FILE="$KWINSCRIPT_BUILDDIR/metadata.desktop"

cp "$KWINSCRIPT_SOURCEDIR/metadata.desktop" "$METADATA_FILE"
sed -i "s/\$VER/${npm_package_version:-1.0}/" "$METADATA_FILE"

echo "📦 Zipping KWin Script..."
KWINPKG_NAME="bismuth.kwinscript"

# Temporary change directory for archive tools
cd "$KWINSCRIPT_BUILDDIR"
# Remove old packages
rm -f "$KWINPKG_NAME"
# Create new .kwinscript package
zip -qr "$KWINPKG_NAME" ./contents/ ./metadata.desktop
# Get back to the original directory
cd - > /dev/null


echo "🏗️ Building KCM..."

KCM_SOURCEDIR="src/kcm"
KCM_BUILDDIR="build/kcm"

cmake -S "$KCM_SOURCEDIR" -B "$KCM_BUILDDIR" -G Ninja -DCMAKE_BUILD_TYPE=RelWithDebInfo -DCMAKE_EXPORT_COMPILE_COMMANDS=ON
cmake --build "$KCM_BUILDDIR"
ln -sf "$PWD/$KCM_BUILDDIR/compile_commands.json" "$KCM_SOURCEDIR/compile_commands.json" # For LSP

