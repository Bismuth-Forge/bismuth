#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
# 
# SPDX-License-Identifier: MIT

set -e

# Make necessary directories
mkdir -p "${npm_package_config_build_dir:=build}/script/contents/code"

echo "Checking using TS Compiler..."
npx tsc --noEmit --incremental

echo "Bundling using esbuild..."
npx esbuild \
  --bundle src/index.ts \
  --outfile="$npm_package_config_build_dir/script/contents/code/index.mjs" \
  --format=esm \
  --platform=neutral

# Copy resources to the build directory with correct paths
cp -rv res/ui "$npm_package_config_build_dir/script/contents"
cp -rv res/config "$npm_package_config_build_dir/script/contents"

# Copy and update metadata
METADATA_FILE="$npm_package_config_build_dir/script/metadata.desktop"

cp -v res/metadata.desktop "$METADATA_FILE"
sed -i "s/\$VER/${npm_package_version:-1.0}/" "$METADATA_FILE"

