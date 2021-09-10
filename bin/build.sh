#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
# 
# SPDX-License-Identifier: MIT

set -e

# Make necessary directories
mkdir -p "${npm_package_config_build_dir:=build}/contents/code"
mkdir -p "$npm_package_config_build_dir/contents/config"
mkdir -p "$npm_package_config_build_dir/contents/ui"

echo "Checking using TS Compiler..."
npx tsc --noEmit

echo "Bundling using esbuild..."
npx esbuild \
  --bundle src/index.ts \
  --outfile="$npm_package_config_build_dir/contents/code/index.mjs" \
  --format=esm \
  --platform=neutral

# Copy resources to the build directory with correct paths
cp -v res/config.ui "$npm_package_config_build_dir/contents/ui/config.ui"
cp -v res/popup.qml "$npm_package_config_build_dir/contents/ui/popup.qml"
cp -v res/main.qml "$npm_package_config_build_dir/contents/ui/main.qml"
cp -v res/config.xml "$npm_package_config_build_dir/contents/config/main.xml"

# Copy and update metadata
METADATA_FILE="$npm_package_config_build_dir/metadata.desktop"

cp -v res/metadata.desktop "$METADATA_FILE"
sed -i "s/\$VER/${npm_package_version:-1.0}/" "$METADATA_FILE"

