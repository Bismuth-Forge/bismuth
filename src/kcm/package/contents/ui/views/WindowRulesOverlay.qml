// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

import "../components" as BIC
import QtQuick 2.12
import QtQuick.Controls 2.12 as QQC2
import QtQuick.Layouts 1.15
import org.kde.kcm 1.5 as KCM
import org.kde.kirigami 2.7 as Kirigami

Kirigami.OverlaySheet {
    id: root

    header: Kirigami.Heading {
        text: i18nc("@title:window", "Window Rules")
    }

    Kirigami.FormLayout {
        Item {
            Kirigami.FormData.isSection: true
            Kirigami.FormData.label: i18n("Float Windows")
        }

        BIC.ConfigTextField {
            Kirigami.FormData.label: i18n("With classes:")
            placeholderText: i18n("Classes (comma separated)")
            settingName: "floatingClass"
        }

        BIC.ConfigTextField {
            Kirigami.FormData.label: i18n("With titles:")
            placeholderText: i18n("Titles (comma separated)")
            settingName: "floatingTitle"
        }

        BIC.ConfigCheckBox {
            text: i18n("Dialogs and splashes")
            settingName: "floatUtility"
        }

    }

}
