#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
# SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
# 
# SPDX-License-Identifier: MIT

set -e

# Load script to KWin
bin/load-script.sh "$npm_package_config_build_dir/contents/ui/main.qml" \
  "$npm_package_name-test"

# Remove unnecessary files
find "$npm_package_config_build_dir" \
  '(' -name "*.qmlc" -o -name "*.jsc" ')' -delete
