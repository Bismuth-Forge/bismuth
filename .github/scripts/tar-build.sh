#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
# SPDX-License-Identifier: MIT

set -e

tar czf build-artifacts.tar.gz --directory=build .
