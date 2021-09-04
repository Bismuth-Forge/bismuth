#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
# 
# SPDX-License-Identifier: MIT

set -e

KWINPKG_FILE="$npm_package_config_build_dir/${npm_package_name}-${npm_package_version}.kwinscript"

# Remove old archive
rm -f "$KWINPKG_FILE"

# Create new installable package
7z a -tzip "$KWINPKG_FILE" ./$npm_package_config_build_dir/contents/ ./$npm_package_config_build_dir/metadata.desktop