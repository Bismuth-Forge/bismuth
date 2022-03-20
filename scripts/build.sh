#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
# SPDX-License-Identifier: MIT

set -e

echo "🏗️ Building Bismuth..."

cmake -S "." -B "build" -G Ninja -DCMAKE_BUILD_TYPE=RelWithDebInfo -DCMAKE_EXPORT_COMPILE_COMMANDS=ON
cmake --build "build"
ln -sf "$PWD/build/compile_commands.json" "./compile_commands.json" # For LSP
