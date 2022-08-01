#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
# SPDX-License-Identifier: MIT

set -e

apt-get update && apt-get upgrade -y
apt-get update && apt-get install -y \
  zip cmake ninja-build extra-cmake-modules kirigami2-dev \
  libkf5config-dev libkf5configwidgets-dev libkf5coreaddons-dev \
  libkf5declarative-dev libkf5i18n-dev libkf5kcmutils-dev \
  libkdecorations2-dev libqt5svg5-dev qml-module-qtquick* qtbase5-dev \
  qtdeclarative5-dev qtquickcontrols2-5-dev g++ libqt5gui5
