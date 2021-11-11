#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
# SPDX-License-Identifier: MIT

set -e

echo "📦 Installing Bismuth..."

sudo cmake --install "build"

echo ""
echo "🎉 Installation finished."
echo ""
echo "💡 You can now enable and configure Bismuth in the System Settings → Window Management → Window Tiling."
echo "🦾 "$(tput bold)"Don't forget to enable window tiling."$(tput sgr0)" We hope you will enjoy it!"

if command -v systemsettings5 > /dev/null; then
  systemsettings5 kcm_bismuth > /dev/null 2>&1 &
  exit 0
fi

if command -v systemsettings > /dev/null; then
  systemsettings kcm_bismuth > /dev/null 2>&1 &
  exit 0
fi

if command -v kcmshell5 > /dev/null; then
  kcmshell5 kcm_bismuth > /dev/null 2>&1 &
  exit 0
fi
