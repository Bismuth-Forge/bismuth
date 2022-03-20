# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
# SPDX-License-Identifier: MIT

cmake_minimum_required(VERSION 3.16)

project(bismuth-kcm)

add_library(kcm_bismuth MODULE)

qt_add_dbus_interface(kwin_dbus_srcs org.kde.KWin.xml kwin_interface)

target_sources(kcm_bismuth PRIVATE bismuth.cpp ${kwin_dbus_srcs})

target_link_libraries(
  kcm_bismuth
  PRIVATE Qt5::Core
          Qt5::DBus
          KF5::CoreAddons
          KF5::I18n
          KF5::QuickAddons
          KF5::ConfigCore
          KF5::ConfigGui)

kconfig_add_kcfg_files(kcm_bismuth GENERATE_MOC "bismuth_config.kcfgc")
kcoreaddons_desktop_to_json(kcm_bismuth "package/metadata.desktop")

install(TARGETS kcm_bismuth DESTINATION ${KDE_INSTALL_PLUGINDIR}/kcms)
install(
  FILES package/metadata.desktop
  RENAME kcm_bismuth.desktop
  DESTINATION ${KDE_INSTALL_KSERVICES5DIR})

kpackage_install_package(package kcm_bismuth kcms)

add_subdirectory(icons)
