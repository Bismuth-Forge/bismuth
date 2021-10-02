#!/bin/bash

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
#
# SPDX-License-Identifier: MIT

set -e

# Download latest release
echo "🕸️ Downloading the latest release..."
wget -q --output-document /tmp/bismuth.tar.gz https://github.com/gikari/bismuth/releases/latest/download/bismuth.tar.gz

# Extract it
echo "📦 Extracting..."
mkdir -p /tmp/bismuth
tar xf /tmp/bismuth.tar.gz --directory=/tmp/bismuth

# Install it
cd /tmp/bismuth
./install.sh
cd - > /dev/null
