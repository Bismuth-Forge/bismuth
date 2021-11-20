# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
# SPDX-License-Identifier: MIT

cmake_minimum_required(VERSION 3.16)

project(bismuth)

option(
  USE_TSC
  "Use TypeScript Compler to check the code before bundling \
  using esbuild. This could be useful, if you know, that the \
  code is correct and you want to speed up building times. \
  For example - you are a packager."
  ON
)

option(
  USE_NPM
  "Use npm installed packages during the build. You might \
  want to disable this option, if you want to use natively \
  installed tools. In particular build systems won't use \
  \"npx\" prefix before commands."
  ON
)

set(QT_MIN_VERSION "5.15.0")
set(KF5_MIN_VERSION "5.80.0")

find_package(ECM ${KF5_MIN_VERSION} REQUIRED NO_MODULE)
set(CMAKE_MODULE_PATH ${ECM_MODULE_PATH})

include(KDEInstallDirs)
include(KDECMakeSettings)
include(KDECompilerSettings NO_POLICY_SCOPE)

include(ECMInstallIcons)

find_package(
  Qt5 ${QT_MIN_VERSION} CONFIG REQUIRED COMPONENTS
  DBus
  Quick
  Svg
)

find_package(
  KF5 ${KF5_MIN_VERSION} REQUIRED COMPONENTS
  I18n
  KCMUtils
  Declarative
  Config
)

add_subdirectory(src)
