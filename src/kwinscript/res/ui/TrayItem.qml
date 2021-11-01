// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import QtQuick 2.0

import Qt.labs.platform 1.1 as Labs

Labs.SystemTrayIcon {
  id: root
  visible: true
  icon.name: "bismuth"
  tooltip: "Windows' Tiling"

  menu: Labs.Menu {
    id: menu
    visible: false // Prevent from showing on Script Loading

    property var onToggleTiling: () => {}

    Labs.MenuItem {
      text: i18n("Toggle Tiling")
      icon.name: "window"
      onTriggered: () => menu.onToggleTiling()
    }
  }
}
