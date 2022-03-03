#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
# SPDX-License-Identifier: MIT

set -e

echo "📦 Installing Bismuth..."

sudo cmake --install "build"

echo "🎉 Installation finished."
echo "💡 You can enable and configure window tiling in the System Settings > Window Management > Window Tiling."
echo "🦾 Don't forget to enable window tiling. We hope you will enjoy it!"
