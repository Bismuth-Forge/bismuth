# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
# SPDX-FileCopyrightText: 2023 Alexander Lohnau <alexander.lohnau@kde.org>
# SPDX-License-Identifier: MIT

kcoreaddons_add_plugin(kcm_bismuth INSTALL_NAMESPACE plasma/kcms/systemsettings)
kcmutils_generate_desktop_file(kcm_bismuth)

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

kpackage_install_package(package kcm_bismuth kcms)

add_subdirectory(icons)
