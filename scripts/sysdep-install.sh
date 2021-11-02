#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
# SPDX-License-Identifier: MIT

set -e

echo "⛓️ Installing system dependencies..."

if [ -f /etc/os-release ]; then
  . /etc/os-release

  case $ID in

    "ubuntu" | "pop" | "debian")
      sudo apt-get install -y \
        zip cmake ninja-build extra-cmake-modules kirigami2-dev \
        libkf5config-dev libkf5configwidgets-dev libkf5coreaddons-dev \
        libkf5declarative-dev libkf5i18n-dev libkf5kcmutils-dev \
        libqt5svg5-dev qml-module-qtquick* qtbase5-dev \
        qtdeclarative5-dev qtquickcontrols2-5-dev g++
      ;;

    "fedora")
      sudo dnf install -y \
        kf5-kconfigwidgets-devel qt5-qtbase-devel qt5-qtbase-private-devel \
        qt5-qtdeclarative-devel qt5-qtquickcontrols2-devel qt5-qtsvg-devel \
        qt5-qtfeedback-devel cmake ninja-build extra-cmake-modules \
        kf5-kcmutils-devel kf5-ki18n-devel kf5-kdeclarative-devel
      ;;

    "opensuse-tumbleweed" | "opensuse-leap")
      sudo zypper --non-interactive install --recommends -t pattern devel_qt5 devel_C_C++
      sudo zypper --non-interactive in -y \
        ninja extra-cmake-modules kconfig-devel kcmutils-devel kdeclarative-devel \
        ki18n-devel
      ;;

    "arch")
      sudo pacman -S --noconfirm --needed \
        cmake ninja extra-cmake-modules
      ;;

    *)
      echo "⚠ Your distribution is $PRETTY_NAME, but you have to install system dependencies manually."
      ;;
  esac
else
  echo "⚠ Cannot detect your distribution. You have to install system dependencies manually."
fi
