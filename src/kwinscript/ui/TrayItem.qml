// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
// SPDX-License-Identifier: MIT

import Qt.labs.platform 1.1 as Labs
import QtQuick 2.0

Labs.SystemTrayIcon {
    id: root

    visible: true
    icon.name: "bismuth"
    tooltip: "Windows' Tiling"

    menu: Labs.Menu {
        id: menu

        property var onToggleTiling: () => {
        }

        visible: false // Prevent from showing on Script Loading

        Labs.MenuItem {
            text: i18n("Toggle Tiling")
            icon.name: "window"
            onTriggered: () => {
                return menu.onToggleTiling();
            }
        }

    }

}
