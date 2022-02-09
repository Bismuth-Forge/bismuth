# SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@genda.life>
# SPDX-License-Identifier: MIT

project(bismuth-core)

add_library(bismuth_core SHARED)
add_Library(Bismuth::Core ALIAS bismuth_core)

add_subdirectory(plasma-api)

target_sources(
  bismuth_core
  PRIVATE
  qml-plugin.cpp
  ts-proxy.cpp
  controller.cpp
  qmldir
)

target_link_libraries(
  bismuth_core
  PRIVATE
  Qt5::Core
  Qt5::Quick
  Qt5::Qml
  KF5::ConfigCore
  KF5::ConfigGui
  KF5::GlobalAccel
  KF5::I18n
)

target_compile_definitions(
  bismuth_core
  PRIVATE
  # Make all Doctest symbols exported
  DOCTEST_CONFIG_IMPLEMENTATION_IN_DLL
)

kconfig_add_kcfg_files(bismuth_core GENERATE_MOC "config.kcfgc")

install(
  FILES "qmldir"
  DESTINATION "${KDE_INSTALL_QMLDIR}/org/kde/bismuth/core"
)

install(
  TARGETS bismuth_core
  DESTINATION "${KDE_INSTALL_QMLDIR}/org/kde/bismuth/core"
)
