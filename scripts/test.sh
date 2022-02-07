#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@genda.life>
# SPDX-License-Identifier: MIT

set -e

SCRIPTS_DIR=$(dirname "$0")
$SCRIPTS_DIR/build.sh

echo "🧪 Testing Bismuth..."

build/bin/test_runner

