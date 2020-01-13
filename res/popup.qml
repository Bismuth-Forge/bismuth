// Copyright (c) 2018 Eon S. Jeon <esjeon@hyunmu.am>
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

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