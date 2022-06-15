#!/usr/bin/env sh

# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
# SPDX-License-Identifier: MIT

set -e

echo "⛓️ Installing system dependencies..."

if [ -f /etc/os-release ]; then
  . /etc/os-release

  case $ID in

    "ubuntu" | "pop" | "debian" | "neon" )
      sudo apt-get install -y \
        g++ cmake ninja-build extra-cmake-modules kirigami2-dev \
        libkf5config-dev libkf5configwidgets-dev libkf5coreaddons-dev \
        libkf5declarative-dev libkf5i18n-dev libkf5kcmutils-dev \
        libkf5globalaccel-dev libkdecorations2-dev libqt5svg5-dev \
        qml-module-qtquick* qtbase5-dev \
        qtdeclarative5-dev qtquickcontrols2-5-dev g++
      ;;

    "fedora")
      sudo dnf install -y \
        kf5-kconfigwidgets-devel qt5-qtbase-devel qt5-qtbase-private-devel \
        qt5-qtdeclarative-devel qt5-qtquickcontrols2-devel qt5-qtsvg-devel \
        qt5-qtfeedback-devel cmake ninja-build extra-cmake-modules \
        kf5-kcmutils-devel kf5-ki18n-devel kf5-kdeclarative-devel \
        kdecoration-devel kf5-kglobalaccel-devel
      ;;

    "opensuse-tumbleweed" | "opensuse-leap")
      sudo zypper --non-interactive install --recommends -t pattern devel_qt5 devel_C_C++
      sudo zypper --non-interactive in -y \
        ninja extra-cmake-modules kconfig-devel kcmutils-devel kdeclarative-devel \
        ki18n-devel libkdecoration2-devel kglobalaccel-devel libkdecoration2-devel \

      ;;

    "arch" | "manjaro")
      sudo pacman -S --noconfirm --needed \
        gcc cmake ninja extra-cmake-modules kdecoration
      ;;

    "void")
      sudo xbps-install gcc git nodejs cmake ninja extra-cmake-modules \
        kconfig-devel kconfigwidgets-devel ki18n-devel kcoreaddons-devel \
        kdeclarative-devel kcmutils-devel qt5-svg-devel qt5-declarative-devel \
        qt5-quickcontrols2-devel gettext-devel knotifications-devel \
        kpackage-devel kservice-devel kiconthemes-devel kdoctools-devel \
        kauth-devel kcrash-devel kjobwidgets-devel ksolid-devel kio-devel \
        kwallet-devel kconfigwidgets-devel ktextwidgets-devel kglobalaccel-devel \
        kdeclarative-devel kxmlgui-devel kcmutils-devel kbookmarks-devel \
        kdecoration-devel
      ;;

    *)
      echo "⚠ Your distribution is $PRETTY_NAME, but you have to install system dependencies manually."
      ;;
  esac
else
  echo "⚠ Cannot detect your distribution. You have to install system dependencies manually."
fi
