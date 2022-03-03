#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
# SPDX-License-Identifier: MIT

set -e

echo "🏗️ Building Bismuth Testing Build..."

cmake -S "." -B "build" -G Ninja \
  -DCMAKE_BUILD_TYPE=RelWithDebInfo \
  -DCMAKE_EXPORT_COMPILE_COMMANDS=ON \
  -DBUILD_TESTING=true

cmake --build "build"

echo "🧪 Testing Bismuth..."

build/bin/test_runner
