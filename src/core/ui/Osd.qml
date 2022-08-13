// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021-2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

import QtQuick 2.15
import QtQuick.Layouts 1.15
import org.kde.kwin 2.0
import org.kde.plasma.components 3.0 as PC3
import org.kde.plasma.core 2.0 as PlasmaCore

PlasmaCore.Dialog {
    id: root

    property rect screenGeometry

    function show(text: string, icon: string, hint: string) {
        // Abort any previous timers
        hideTimer.stop();
        // Update current screen information
        root.screenGeometry = workspace.clientArea(KWin.FullScreenArea, workspace.activeScreen, workspace.currentDesktop);
        // Set the icon and text
        messageText.text = text;
        messageIcon.source = icon || "bismuth"; // Fallback to the default icon when undefined
        messageHint.text = hint || ""; // Fallback to the empty string when undefined
        // Show the popup
        root.visible = true;
        // Start popup hide timer
        hideTimer.interval = 3000;
        hideTimer.start();
    }

    type: PlasmaCore.Dialog.OnScreenDisplay
    flags: Qt.Popup | Qt.WindowStaysOnTopHint
    location: PlasmaCore.Types.Floating
    outputOnly: true
    // Spawn popup a little bit lower than the center of the screen for consistency
    x: (screenGeometry.x + screenGeometry.width / 2) - width / 2
    y: (screenGeometry.y + screenGeometry.height * 2 / 3) - height / 2
    visible: false
    Component.onCompleted: {
        KWin.registerWindow(this);
    }

    mainItem: RowLayout {
        id: main

        // Make popup size consistent with the other Plasma OSD (e.g. PulseAudio one)
        Layout.minimumWidth: Math.max(messageText.implicitWidth, PlasmaCore.Units.gridUnit * 15)
        Layout.minimumHeight: PlasmaCore.Units.gridUnit * 1.35

        PlasmaCore.IconItem {
            id: messageIcon

            Layout.leftMargin: PlasmaCore.Units.smallSpacing
            Layout.preferredWidth: PlasmaCore.Units.iconSizes.medium
            Layout.preferredHeight: PlasmaCore.Units.iconSizes.medium
            Layout.alignment: Qt.AlignVCenter
        }

        PC3.Label {
            id: messageText

            Layout.fillWidth: true
            Layout.alignment: Qt.AlignHCenter
            // This font size matches the one from Pulse Audio OSD for consistency
            font.pointSize: PlasmaCore.Theme.defaultFont.pointSize * 1.2
            horizontalAlignment: Text.AlignHCenter
        }

        PC3.Label {
            id: messageHint

            Layout.preferredWidth: widestHintSize.width
            Layout.rightMargin: PlasmaCore.Units.smallSpacing * 2
            Layout.alignment: Qt.AlignHCenter
            // This font size matches the one from Pulse Audio OSD for consistency
            font.pointSize: PlasmaCore.Theme.defaultFont.pointSize * 1.2
            horizontalAlignment: Text.AlignHCenter
        }

        // Get the width of a two-digit number so we can size the hint
        // to the maximum width to avoid the main text moving around
        TextMetrics {
            id: widestHintSize

            text: i18n("10")
            font: messageHint.font
        }

        // Hides the popup window when triggered
        Timer {
            id: hideTimer

            repeat: false
            onTriggered: {
                root.visible = false;
            }
        }

    }

}
