#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
# SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
# SPDX-License-Identifier: MIT

set -e

echo "🔥 Uninstalling Bismuth..."
sudo xargs rm < "build/install_manifest.txt"
