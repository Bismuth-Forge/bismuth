// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

import QtQuick 2.12
import QtQuick.Controls 2.12 as QQC2
import org.kde.kcm 1.5 as KCM
import org.kde.kirigami 2.7 as Kirigami

QQC2.SpinBox {
    id: root

    /**
     * Name for the config option to represent
     */
    property string settingName: ""

    // Implicit dimensions are set to break binding loop
    implicitWidth: Kirigami.Units.gridUnit * 5
    implicitHeight: Kirigami.Units.gridUnit * 1.75
    value: kcm.config[settingName]
    onValueModified: kcm.config[settingName] = value

    KCM.SettingStateBinding {
        configObject: kcm.config
        settingName: root.settingName
    }

}
