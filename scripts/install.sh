#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
# SPDX-License-Identifier: MIT

set -e

echo "📦 Installing Bismuth..."

sudo cmake --install "build"

echo "🎉 Installation finished."
echo "💡 You can configure Bismuth in the System Settings > Window Management > Window Tiling."
echo "🦾 Enjoy your tiling!"
