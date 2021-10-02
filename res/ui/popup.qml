// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
//
// SPDX-License-Identifier: MIT

import QtQuick 2.0
import QtQuick.Controls 2.0
import org.kde.plasma.core 2.0 as PlasmaCore;

/* 
 * Component Documentation
 *  - PlasmaCore global `theme` object:
 *      https://techbase.kde.org/Development/Tutorials/Plasma2/QML2/API#Plasma_Themes
 *  - PlasmaCore.Dialog:
 *      https://techbase.kde.org/Development/Tutorials/Plasma2/QML2/API#Top_Level_windows
 */

PlasmaCore.Dialog {
    id: popupDialog
    type: PlasmaCore.Dialog.OnScreenDisplay
    flags: Qt.Popup | Qt.WindowStaysOnTopHint
    location: PlasmaCore.Types.Floating
    outputOnly: true

    visible: false

    mainItem: Item {
        width: messageLabel.implicitWidth
        height: messageLabel.implicitHeight

        Label {
            id: messageLabel
            padding: 10

            // TODO: customizable font & size ????
            font.pointSize: Math.round(theme.defaultFont.pointSize * 2)
            font.weight: Font.Bold
        }

        /* hides the popup window when triggered */
        Timer {
            id: hideTimer
            repeat: false

            onTriggered: {
                popupDialog.visible = false;
            }
        }
    }

    Component.onCompleted: {
        /* NOTE: IDK what this is, but this is necessary to keep the window working. */
        KWin.registerWindow(this);
    }

    function show(text, area, duration) {
        hideTimer.stop();

        messageLabel.text = text;

        this.x = (area.x + area.width / 2) - this.width / 2;
        this.y = (area.y + area.height / 2) - this.height / 2;
        this.visible = true;

        hideTimer.interval = duration;
        hideTimer.start();
    }
}
