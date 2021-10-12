// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
//
// SPDX-License-Identifier: MIT

import QtQuick 2.0
import org.kde.plasma.components 2.0 as Plasma;
import org.kde.kwin 2.0;
import org.kde.taskmanager 0.1 as TaskManager
import "../code/index.mjs" as Bismuth

Item {
    id: scriptRoot

    TaskManager.ActivityInfo {
        id: activityInfo
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
        console.log("[Bismuth] Initiating the script");

        const qmlObjects = {
            scriptRoot: scriptRoot,
            activityInfo: activityInfo,
            popupDialog: popupDialog
        };

        const kwinScriptingAPI = {
            workspace: workspace,
            options: options,
            KWin: KWin
        };

        Bismuth.init(qmlObjects, kwinScriptingAPI);
    }
}
