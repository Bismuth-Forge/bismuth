#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
# SPDX-License-Identifier: MIT

set -e

# Remove build directory and package-lock
rm -vrf "build"
rm -vf package-lock.json
rm -vrf node_modules/
