// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

import QtQuick 2.12
import QtQuick.Controls 2.12 as QQC2
import QtQuick.Layouts 1.15
import org.kde.kcm 1.5 as KCM
import org.kde.kirigami 2.7 as Kirigami

KCM.SimpleKCM {
    id: root

    KCM.ConfigModule.quickHelp: i18n("This module lets you manage various window tiling options.")
    implicitWidth: Kirigami.Units.gridUnit * 38
    implicitHeight: Kirigami.Units.gridUnit * 35

    // TODO: replace this TabBar-plus-Frame-in-a-ColumnLayout with whatever shakes
    // out of https://bugs.kde.org/show_bug.cgi?id=394296
    ColumnLayout {
        id: tabLayout

        spacing: 0

        QQC2.TabBar {
            id: tabBar

            // Tab styles generally assume that they're touching the inner layout,
            // not the frame, so we need to move the tab bar down a pixel and make
            // sure it's drawn on top of the frame
            z: 1
            Layout.bottomMargin: -1

            QQC2.TabButton {
                text: i18n("Behavior")
            }

            QQC2.TabButton {
                text: i18n("Appearance")
            }

        }

        QQC2.Frame {
            Layout.fillWidth: true
            Layout.fillHeight: true

            StackLayout {
                currentIndex: tabBar.currentIndex
                anchors.fill: parent
                // This breaks anything inside, that is not FormLayout
                // but necessary for adequate padding
                anchors.topMargin: Kirigami.Units.gridUnit * -0.5

                // For some reason QML is very British and
                // refuses to load the Behavior.qml (without "u")
                Behaviour {
                }

                Appearance {
                }

            }

        }

    }

}
