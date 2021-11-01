<!-- SPDX-FileCopyrightText: none -->
<!-- SPDX-License-Identifier: MIT -->

# 🤝 Contributing

We glad, that you want to contribute to the project. To make things easier please read the
following.

## 🏗️ Development packages

To make sure you can develop the script install all the tools you need:

- [REUSE tool](https://git.fsfe.org/reuse/tool#install)
- [CMake](https://cmake.org/) (3.21 or later)
- [Pre-commit](https://pre-commit.com/)
- [Clang-format](https://clang.llvm.org/docs/ClangFormat.html)

## 👷 Prepare environment

The command will install Git pre-commit hooks you will need, such as automatic
REUSE validation and autoformatting.

```bash
pre-commit install
```

Install the dependencies on your Linux Distribution:

```bash
# Ubuntu
sudo apt install -y \
  cmake ninja-build extra-cmake-modules kirigami2-dev \
  libkf5config-dev libkf5configwidgets-dev libkf5coreaddons-dev \
  libkf5declarative-dev libkf5i18n-dev libkf5kcmutils-dev \
  libqt5svg5-dev qml-module-qtquick* qtbase5-dev \
  qtdeclarative5-dev qtquickcontrols2-5-dev g++
```

```bash
# Fedora
sudo dnf install -y \
  kf5-kconfigwidgets-devel qt5-qtbase-devel qt5-qtbase-private-devel \
  qt5-qtdeclarative-devel qt5-qtquickcontrols2-devel qt5-qtsvg-devel \
  qt5-qtfeedback-devel cmake ninja-build extra-cmake-modules \
  kf5-kcmutils-devel kf5-ki18n-devel kf5-kdeclarative-devel
```

```bash
# OpenSUSE
sudo zypper --non-interactive install --recommends -t pattern devel_qt5 devel_C_C++
sudo zypper --non-interactive in -y \
  ninja extra-cmake-modules kconfig-devel kcmutils-devel kdeclarative-devel \
  ki18n-devel
```

## 🛠️ Building

```bash
cmake --preset default
cmake --build --preset default
```

## 🧪 Testing

```bash
source build/prefix.sh
kcmshell5 kcm_bismuth
```
