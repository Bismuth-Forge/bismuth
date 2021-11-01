#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
# SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
# SPDX-License-Identifier: MIT

set -e

echo "🔥 Uninstalling KWin Script..."
plasmapkg2 -t kwinscript -r "${npm_package_name:-Bismuth}"

echo "🔥 Uninstalling KCM..."
KCM_BUILDDIR="build/kcm"

sudo xargs rm < "$KCM_BUILDDIR/install_manifest.txt"

