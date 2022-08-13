# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
# SPDX-License-Identifier: MIT

cmake_minimum_required(VERSION 3.16)

project(bismuth-kwinscript)

add_custom_target(
  KWinScript ALL
  COMMENT "🏗️ Building KWin Script..."
  DEPENDS "bismuth/contents/ui")

add_custom_command(
  OUTPUT "bismuth/contents/ui"
  COMMAND
    "${CMAKE_COMMAND}" "-E" "copy_directory" "${CMAKE_CURRENT_SOURCE_DIR}/ui"
    "${CMAKE_CURRENT_BINARY_DIR}/bismuth/contents/ui"
  DEPENDS "${CMAKE_CURRENT_SOURCE_DIR}/ui/main.qml"
  COMMENT "📑 Preparing UI and metadata files...")

configure_file("metadata.desktop" "bismuth/metadata.desktop" @ONLY)

install(DIRECTORY "${CMAKE_CURRENT_BINARY_DIR}/bismuth"
        DESTINATION "${KDE_INSTALL_DATAROOTDIR}/kwin/scripts")

add_subdirectory(icons)
