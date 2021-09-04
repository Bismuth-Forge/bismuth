#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
# 
# SPDX-License-Identifier: MIT

set -e

# Make necessary directories
mkdir -p "${npm_package_config_build_dir:=build}/contents/code"
mkdir -p "$npm_package_config_build_dir/contents/config"
mkdir -p "$npm_package_config_build_dir/contents/ui"

# Compile source into the form usable from QML
echo "Compiling typescript..."
npx tsc --outDir "$npm_package_config_build_dir/contents/code/"

# Rename all js files to mjs, because TypeScript cannot do that (https://github.com/Microsoft/TypeScript/issues/18442)
# We need to to that in order to use Javascripts modules from Qt
find "$npm_package_config_build_dir/contents/code/" -name "*.js" -exec bash -c 'mv "$1" "${1%.js}".mjs' - '{}' \;

# Fix the import statements (replace .js to .mjs, or add .mjs extention)
find "$npm_package_config_build_dir/contents/code/" -name "*.mjs" -exec sed -i '/^import/s/\(\.js\)*";*$/.mjs";/g' {} +

# Copy resources to the build directory with correct paths
cp -v res/config.ui "$npm_package_config_build_dir/contents/ui/config.ui"
cp -v res/popup.qml "$npm_package_config_build_dir/contents/ui/popup.qml"
cp -v res/main.qml "$npm_package_config_build_dir/contents/ui/main.qml"
cp -v res/config.xml "$npm_package_config_build_dir/contents/config/main.xml"

# Copy and update metadata
METADATA_FILE="$npm_package_config_build_dir/metadata.desktop"

cp -v res/metadata.desktop "$METADATA_FILE"
sed -i "s/\$VER/${npm_package_version:-1.0}/" "$METADATA_FILE"

