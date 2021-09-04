#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
# 
# SPDX-License-Identifier: MIT

set -e

# Remove build directory and package-lock
rm -vrf "${npm_package_config_build_dir:=build}"
rm -vf package-lock.json
rm -vrf node_modules/

