# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
# SPDX-License-Identifier: MIT

cmake_minimum_required(VERSION 3.16)

project(bismuth-kwinscript)

# HACK: Use git to get the recent version
# We could explicitly set the version via project declaration
# But this would conflict with package.json and would
# Require automatic change via Release Please time CI
execute_process(COMMAND "git" "describe" "--tags" "--abbrev=0" OUTPUT_VARIABLE CMAKE_PROJECT_VERSION)
string(REPLACE "\n" "" CMAKE_PROJECT_VERSION "${CMAKE_PROJECT_VERSION}")
string(REPLACE "v" "" CMAKE_PROJECT_VERSION "${CMAKE_PROJECT_VERSION}")

find_package(ECM ${KF5_MIN_VERSION} REQUIRED NO_MODULE)
set(CMAKE_MODULE_PATH ${ECM_MODULE_PATH})

include(KDEInstallDirs)
include(KDECMakeSettings)

include(ECMInstallIcons)

add_custom_target(
  KWinScript ALL
  COMMENT "🏗️ Building KWin Script..."
  DEPENDS
  "bismuth/contents/code/index.mjs"
  "bismuth/contents/ui"
)

add_custom_command(
  OUTPUT "bismuth/contents/code/index.mjs"
  COMMAND "npx" "esbuild"
  "--bundle" "${CMAKE_CURRENT_SOURCE_DIR}/index.ts"
  "--outfile=${CMAKE_CURRENT_BINARY_DIR}/bismuth/contents/code/index.mjs"
  "--format=esm"
  "--platform=neutral"
  DEPENDS LintViaTSC
  COMMENT "🎁 Bundling using esbuild..."
)

add_custom_target(
  LintViaTSC
  COMMAND "npx" "tsc" "--noEmit" "--incremental"
  COMMENT "👮 Checking sources using TS Compiler..."
)

add_custom_command(
  OUTPUT "bismuth/contents/ui"
  COMMAND "${CMAKE_COMMAND}" "-E" "copy_directory"
  "${CMAKE_CURRENT_SOURCE_DIR}/ui" "${CMAKE_CURRENT_BINARY_DIR}/bismuth/contents/ui"
  COMMENT "📑 Preparing UI and metadata files..."
)

configure_file("metadata.desktop" "bismuth/metadata.desktop" @ONLY)

install(
  DIRECTORY "${CMAKE_CURRENT_BINARY_DIR}/bismuth"
  DESTINATION "${KDE_INSTALL_DATAROOTDIR}/kwin/scripts"
)

add_subdirectory(icons)
