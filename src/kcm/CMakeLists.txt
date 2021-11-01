# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
# SPDX-License-Identifier: MIT

cmake_minimum_required(VERSION 3.16)

project(bismuth-kcm)

set(QT_MIN_VERSION "5.15.0")
set(KF5_MIN_VERSION "5.80.0")

find_package(ECM ${KF5_MIN_VERSION} REQUIRED NO_MODULE)
set(CMAKE_MODULE_PATH ${ECM_MODULE_PATH})

include(KDEInstallDirs)
include(KDECMakeSettings)
include(KDEFrameworkCompilerSettings NO_POLICY_SCOPE)

find_package(
  Qt5 ${QT_MIN_VERSION} CONFIG REQUIRED COMPONENTS
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

add_library(kcm_bismuth MODULE)

target_sources(
  kcm_bismuth
  PRIVATE
  bismuth.cpp
)

target_link_libraries(
  kcm_bismuth
  PRIVATE
  Qt5::Core
  KF5::CoreAddons
  KF5::I18n
  KF5::QuickAddons
  KF5::ConfigCore
  KF5::ConfigGui
)

kconfig_add_kcfg_files(kcm_bismuth GENERATE_MOC bismuth_config.kcfgc)
kcoreaddons_desktop_to_json(kcm_bismuth "package/metadata.desktop")

install(FILES "bismuth_config.kcfg" DESTINATION ${KDE_INSTALL_KCFGDIR})
install(TARGETS kcm_bismuth DESTINATION ${KDE_INSTALL_PLUGINDIR}/kcms)
install(FILES package/metadata.desktop RENAME kcm_bismuth.desktop DESTINATION ${KDE_INSTALL_KSERVICES5DIR})

kpackage_install_package(package kcm_bismuth kcms)
