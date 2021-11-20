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

add_custom_target(
  KWinScript ALL
  COMMENT "🏗️ Building KWin Script..."
  DEPENDS
  "bismuth/contents/code/index.mjs"
  "bismuth/contents/ui"
)

file(GLOB_RECURSE TYPESCRIPT_SOURCES CONFIGURE_DEPENDS "*.ts")

if(USE_TSC)
  set(TSC_COMMAND "npx" "tsc" "--noEmit" "--incremental")
endif()

add_custom_command(
  OUTPUT "bismuth/contents/code/index.mjs"
  COMMAND ${TSC_COMMAND}
  COMMAND "npx" "esbuild"
  "--bundle" "${CMAKE_CURRENT_SOURCE_DIR}/index.ts"
  "--outfile=${CMAKE_CURRENT_BINARY_DIR}/bismuth/contents/code/index.mjs"
  "--format=esm"
  "--platform=neutral"
  DEPENDS ${TYPESCRIPT_SOURCES}
  COMMENT "🏗️ Compiling and bundling TypeScirpt sources..."
)

add_custom_command(
  OUTPUT "bismuth/contents/ui"
  COMMAND "${CMAKE_COMMAND}" "-E" "copy_directory"
  "${CMAKE_CURRENT_SOURCE_DIR}/ui" "${CMAKE_CURRENT_BINARY_DIR}/bismuth/contents/ui"
  DEPENDS
  "${CMAKE_CURRENT_SOURCE_DIR}/ui/main.qml"
  "${CMAKE_CURRENT_SOURCE_DIR}/ui/TrayItem.qml"
  "${CMAKE_CURRENT_SOURCE_DIR}/ui/popup.qml"
  COMMENT "📑 Preparing UI and metadata files..."
)

configure_file("metadata.desktop" "bismuth/metadata.desktop" @ONLY)

install(
  DIRECTORY "${CMAKE_CURRENT_BINARY_DIR}/bismuth"
  DESTINATION "${KDE_INSTALL_DATAROOTDIR}/kwin/scripts"
)

add_subdirectory(icons)
