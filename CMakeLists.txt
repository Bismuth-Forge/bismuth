# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
# SPDX-License-Identifier: MIT

cmake_minimum_required(VERSION 3.16)

project(bismuth)

option(
  USE_TSC
  "Use TypeScript Compiler to check the code before bundling \
  using esbuild. This could be useful, if you know, that the \
  code is correct and you want to speed up building times. \
  For example - you are a packager."
  ON)

option(
  USE_NPM
  "Use npm installed packages during the build. You might \
  want to disable this option, if you want to use natively \
  installed tools. In particular build systems won't use \
  \"npx\" prefix before commands."
  ON)

set(QT_MIN_VERSION "5.15.0")
set(KF5_MIN_VERSION "5.78.0")

# HACK: Use git to get the recent version We could explicitly set the version
# via project declaration But this would conflict with package.json and would
# Require automatic change via Release Please time CI
execute_process(COMMAND "git" "describe" "--tags" "--abbrev=0"
                OUTPUT_VARIABLE CMAKE_PROJECT_VERSION)
string(REPLACE "\n" "" CMAKE_PROJECT_VERSION "${CMAKE_PROJECT_VERSION}")
string(REPLACE "v" "" CMAKE_PROJECT_VERSION "${CMAKE_PROJECT_VERSION}")

# TODO: Less hacky solution, however it requires CMake 3.19 which is not so
# common across distros as of now. Uncomment when cmake_minimum_required >=
# 3.19.
#
# # Set the project version file(READ ${CMAKE_CURRENT_SOURCE_DIR}/package.json
# PACKAGE_JSON) string(JSON CMAKE_PROJECT_VERSION GET ${PACKAGE_JSON} version)
# unset(PACKAGE_JSON)

find_package(ECM ${KF5_MIN_VERSION} REQUIRED NO_MODULE)
set(CMAKE_MODULE_PATH ${ECM_MODULE_PATH} "${PROJECT_SOURCE_DIR}/cmake/")

include(KDEInstallDirs)
include(KDECMakeSettings)
include(KDEClangFormat)
include(ECMInstallIcons)
include(ECMQtDeclareLoggingCategory)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

find_package(Qt5 ${QT_MIN_VERSION} CONFIG REQUIRED COMPONENTS DBus Quick Svg
                                                              Test)

find_package(
  KF5 ${KF5_MIN_VERSION} REQUIRED
  COMPONENTS Config
             ConfigWidgets
             CoreAddons
             Declarative
             GlobalAccel
             KCMUtils
             I18n)

find_package(KDecoration2 REQUIRED)

include_directories("${PROJECT_SOURCE_DIR}/external")

if(NOT BUILD_TESTING)
  add_compile_definitions(DOCTEST_CONFIG_DISABLE)
endif()

add_subdirectory(src)

if(BUILD_TESTING)
  add_subdirectory(tests)
endif()
