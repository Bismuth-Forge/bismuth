# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
# SPDX-License-Identifier: MIT

cmake_minimum_required(VERSION 3.16)

project(bismuth-kwinscript)

add_custom_target(
  KWinScript ALL
  COMMENT "🏗️ Building KWin Script..."
  DEPENDS "bismuth/contents/code/index.mjs" "bismuth/contents/ui")

file(GLOB_RECURSE TYPESCRIPT_SOURCES CONFIGURE_DEPENDS "*.ts")

if(USE_TSC)
  set(TSC_COMMAND "tsc" "--noEmit" "--incremental")
  if(USE_NPM)
    list(PREPEND TSC_COMMAND "npx")
  else()
    message(
      FATAL_ERROR
        "You are trying to use USE_TSC=ON with USE_NPM=OFF options. "
        "This is currently unsupported, because in this case TypeScript Compiler "
        "is going to throw a bunch of errors at you, because it cannot "
        "find a lot of stuff, like Jest or \"console\" JS global variable. "
        "\n"
        "This is happening, because normally TSC thinks, that he looks at "
        "code, that will be used with NPM packages and Node.js runtime. "
        "This is of course is not OK, but we ought to live with this "
        "behavior, because we need to use Jest Unit Testing Framework. "
        "\n"
        "You are supposed to use USE_NPM=OFF only with USE_TSC=OFF, "
        "because, if you are using these options at all, it means, that "
        "you are most probably a packager and packagers do not need "
        "to check TypeScript code for correctness.")
  endif()
endif()

set(ESBUILD_COMMAND
    "esbuild" "--bundle" "${CMAKE_CURRENT_SOURCE_DIR}/index.ts"
    "--outfile=${CMAKE_CURRENT_BINARY_DIR}/bismuth/contents/code/index.mjs"
    "--format=esm" "--platform=neutral")
if(USE_NPM)
  list(PREPEND ESBUILD_COMMAND "npx")
endif()

add_custom_command(
  OUTPUT "bismuth/contents/code/index.mjs"
  COMMAND ${TSC_COMMAND}
  COMMAND ${ESBUILD_COMMAND}
  COMMAND
  DEPENDS ${TYPESCRIPT_SOURCES}
  COMMENT "🏗️ Compiling and bundling TypeScript sources...")

add_custom_command(
  OUTPUT "bismuth/contents/ui"
  COMMAND
    "${CMAKE_COMMAND}" "-E" "copy_directory" "${CMAKE_CURRENT_SOURCE_DIR}/ui"
    "${CMAKE_CURRENT_BINARY_DIR}/bismuth/contents/ui"
  DEPENDS "${CMAKE_CURRENT_SOURCE_DIR}/ui/main.qml"
          "${CMAKE_CURRENT_SOURCE_DIR}/ui/popup.qml"
  COMMENT "📑 Preparing UI and metadata files...")

configure_file("metadata.desktop" "bismuth/metadata.desktop" @ONLY)

install(DIRECTORY "${CMAKE_CURRENT_BINARY_DIR}/bismuth"
        DESTINATION "${KDE_INSTALL_DATAROOTDIR}/kwin/scripts")

add_subdirectory(icons)
