/**
 * SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@genda.life>
 *
 * SPDX-License-Identifier: MIT
 */

import QtQuick 2.12
import QtQuick.Controls 2.12 as QQC2
import QtQuick.Layouts 1.15

import org.kde.kcm 1.5 as KCM
import org.kde.kirigami 2.7 as Kirigami

import "../components" as BIC

Kirigami.OverlaySheet {
  id: monocleOverlay

  header: Kirigami.Heading {
		text: i18nc("@title:window", "Monocle Layout Settings")
  }

  Kirigami.FormLayout {
    BIC.ConfigCheckBox {
      text: i18n("Fully maximize windows (no borders, no gaps)")
      settingName: "monocleMaximize"
    }

    BIC.ConfigCheckBox {
      text: i18n("Minimize unfocused windows")
      settingName: "monocleMinimizeRest"
    }
  }
}
