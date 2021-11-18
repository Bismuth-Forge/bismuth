# SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
# SPDX-License-Identifier: MIT

project(bismuth-dbus-plugin)

add_library(dbus_bismuth_plugin SHARED)

qt_generate_dbus_interface(
  dbus-service.h
  org.kde.bismuth.dbus.xml
  OPTIONS -m
)

target_sources(
  dbus_bismuth_plugin
  PRIVATE
  dbus-service.cpp
  dbus-plugin.cpp
  imports/qmldir
  "${CMAKE_CURRENT_BINARY_DIR}/org.kde.bismuth.dbus.xml"
)

target_link_libraries(
  dbus_bismuth_plugin
  PRIVATE
  Qt5::Core
  Qt5::Quick
  Qt5::Qml
  Qt5::DBus
)

install(
  FILES "${CMAKE_CURRENT_BINARY_DIR}/org.kde.bismuth.dbus.xml"
  DESTINATION "${DBUS_INTERFACES_INSTALL_DIR}"
)

install(
  TARGETS dbus_bismuth_plugin
  DESTINATION "${KDE_INSTALL_QMLDIR}/org/kde/bismuth/dbus"
)

install(
  DIRECTORY imports/ # Slash is important
  DESTINATION "${KDE_INSTALL_QMLDIR}/org/kde/bismuth/dbus"
)
