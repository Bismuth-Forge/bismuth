# SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@genda.life>
# SPDX-License-Identifier: MIT

qt_generate_dbus_interface(
  "dbus-service.hpp"
  "org.kde.bismuth.dbus.xml"
  OPTIONS -m
)

target_sources(
  bismuth_core
  PRIVATE
  dbus-service.cpp
  "${CMAKE_CURRENT_BINARY_DIR}/org.kde.bismuth.dbus.xml"
)

install(
  FILES "${CMAKE_CURRENT_BINARY_DIR}/org.kde.bismuth.dbus.xml"
  DESTINATION "${DBUS_INTERFACES_INSTALL_DIR}"
)

