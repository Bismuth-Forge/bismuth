// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

import "./components" as BIC
import QtQuick 2.12
import QtQuick.Controls 2.12 as QQC2
import QtQuick.Layouts 1.15
import org.kde.kcm 1.5 as KCM
import org.kde.kirigami 2.7 as Kirigami

Kirigami.FormLayout {
    id: appearanceTab

    Item {
        Kirigami.FormData.isSection: true
        Kirigami.FormData.label: i18n("Outer Gaps")
    }

    BIC.PixelsConfigSpinBox {
        Kirigami.FormData.label: i18n("Left:")
        settingName: "screenGapLeft"
    }

    BIC.PixelsConfigSpinBox {
        Kirigami.FormData.label: i18n("Top:")
        settingName: "screenGapTop"
    }

    BIC.PixelsConfigSpinBox {
        Kirigami.FormData.label: i18n("Right:")
        settingName: "screenGapRight"
    }

    BIC.PixelsConfigSpinBox {
        Kirigami.FormData.label: i18n("Bottom:")
        settingName: "screenGapBottom"
    }

    Item {
        Kirigami.FormData.isSection: true
        Kirigami.FormData.label: "Inner Gaps"
    }

    BIC.PixelsConfigSpinBox {
        Kirigami.FormData.label: i18n("All:")
        settingName: "tileLayoutGap"
    }

    Kirigami.Separator {
        Kirigami.FormData.isSection: true
    }

    BIC.ConfigCheckBox {
        text: i18n("No borders around tiled windows")
        settingName: "noTileBorder"
    }

}
