#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
# 
# SPDX-License-Identifier: MIT

set -e

EXTRACT_DIR="${npm_package_config_build_dir:-build}/extracted-package"

# Make directory for extraction
mkdir -p "$EXTRACT_DIR"

# Extract built package
tar xf "${npm_package_config_build_dir:-build}/package/bismuth.tar.gz" --directory="$EXTRACT_DIR"

# Run installation script
cd "$EXTRACT_DIR"
./install.sh
cd - > /dev/null

