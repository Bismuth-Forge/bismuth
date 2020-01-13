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
import org.kde.plasma.core 2.0 as PlasmaCore;
import org.kde.plasma.components 2.0 as Plasma;
import org.kde.kwin 2.0;
import org.kde.taskmanager 0.1 as TaskManager
import "../code/script.js" as K

Item {
    id: scriptRoot

    TaskManager.ActivityInfo {
        id: activityInfo
    }

    PlasmaCore.DataSource {
        id: mousePoller
        engine: 'executable'
    }

    Loader {
        id: popupDialog
        source: "popup.qml"

        function show(text) {
            var area = workspace.clientArea(KWin.FullScreenArea, workspace.activeScreen, workspace.currentDesktop);
            this.item.show(text, area, 1000);
        }
    }

    Component.onCompleted: {
        console.log("KROHNKITE: starting the script");
        (new K.KWinDriver()).main();
    }
}