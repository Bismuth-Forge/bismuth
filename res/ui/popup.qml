// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import QtQuick 2.0
import QtQuick.Controls 2.0
import QtQuick.Layouts 1.15
import org.kde.plasma.core 2.0 as PlasmaCore;
import org.kde.plasma.components 3.0 as PC3

/* 
 * Component Documentation
 *  - PlasmaCore global `theme` object:
 *      https://api.kde.org/frameworks/plasma-framework/html/classPlasma_1_1Theme.html
 *  - PlasmaCore.Dialog:
 *      https://api.kde.org/frameworks/plasma-framework/html/classPlasmaQuick_1_1Dialog.html
 */

PlasmaCore.Dialog {
    id: popupDialog
    type: PlasmaCore.Dialog.OnScreenDisplay
    flags: Qt.Popup | Qt.WindowStaysOnTopHint
    location: PlasmaCore.Types.Floating
    outputOnly: true

    visible: false

    mainItem: RowLayout {
        id: main
        // Make popup size consistent with the other Plasma OSD (e.g. PulseAudio one)
        Layout.minimumWidth: Math.max(messageLabel.implicitWidth, PlasmaCore.Units.gridUnit * 15)
        Layout.minimumHeight: PlasmaCore.Units.gridUnit * 1.35

        PC3.Label {
            id: messageLabel
            anchors.fill: parent
            // This font size matches the one from Pulse Audio OSD for consistency
            font.pointSize: PlasmaCore.Theme.defaultFont.pointSize * 1.2
            horizontalAlignment: Text.AlignHCenter
        }

        // Hides the popup window when triggered
        Timer {
            id: hideTimer
            repeat: false

            onTriggered: {
                popupDialog.visible = false;
            }
        }
    }

    Component.onCompleted: {
        // NOTE: IDK what this is, but this is necessary to keep the window working.
        KWin.registerWindow(this);
    }

    function show(text, area) {
        // Abort any previous timers
        hideTimer.stop();

        // Set the text for the popup
        messageLabel.text = text;

        // Width and height are not computed before the popup is visible
        // therefore we need to make is visible sooner
        this.visible = true;

        // Spawn popup a little bit lower than the center of the screen for consistency
        this.x = (area.x + area.width / 2) - this.width / 2;
        this.y = (area.y + area.height * 2 / 3) - this.height / 2;

        // Start popup hide timer
        hideTimer.interval = 3000;
        hideTimer.start();
    }
}
