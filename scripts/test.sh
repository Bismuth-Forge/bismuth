#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@genda.life>
# SPDX-License-Identifier: MIT

set -e

echo "🏗️ Building Bismuth Testing Build..."

cmake -S "." -B "build/testing" -G Ninja \
  -DCMAKE_BUILD_TYPE=RelWithDebInfo \
  -DCMAKE_EXPORT_COMPILE_COMMANDS=ON \
  -DBUILD_TESTING=true

cmake --build "build/testing"

echo "🧪 Testing Bismuth..."

build/testing/bin/test_runner
