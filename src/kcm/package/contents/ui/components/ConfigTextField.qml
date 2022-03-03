// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

import QtQuick 2.12
import QtQuick.Controls 2.12 as QQC2
import org.kde.kcm 1.5 as KCM

QQC2.TextField {
    id: root

    /**
     * Name for the config option to represent
     */
    property string settingName

    text: kcm.config[settingName]
    onEditingFinished: kcm.config[settingName] = text

    KCM.SettingStateBinding {
        configObject: kcm.config
        settingName: root.settingName
    }

}
