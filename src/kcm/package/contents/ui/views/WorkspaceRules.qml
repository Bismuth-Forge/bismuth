// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

import "../components" as BIC
import QtQuick 2.12
import QtQuick.Controls 2.12 as QQC2
import QtQuick.Layouts 1.15
import org.kde.kcm 1.5 as KCM
import org.kde.kirigami 2.7 as Kirigami

Kirigami.Page {
    id: root

    title: "Workspace Rules"

    Kirigami.FormLayout {
        anchors.fill: parent

        Item {
            Kirigami.FormData.isSection: true
            Kirigami.FormData.label: i18n("Disable Tiling")
        }

        BIC.ConfigTextField {
            Kirigami.FormData.label: "On Activities:"
            placeholderText: "Activities names (comma separated)"
            settingName: "ignoreActivity"
            implicitWidth: Kirigami.Units.gridUnit * 20
        }

        BIC.ConfigTextField {
            // implicitWidth: Kirigami.Units.gridUnit * 20

            Kirigami.FormData.label: "On Screens:"
            placeholderText: "Screen numbers (comma separated)"
            settingName: "ignoreScreen"
        }

    }

}
