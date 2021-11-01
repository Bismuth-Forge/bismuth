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

Kirigami.Page {
  id: root
  title: "Window Layouts"

  ListModel {
    id: layoutsModel
    ListElement {
      name: "Tile"
      settingName: "enableTileLayout"
    }
    ListElement {
      name: "Monocle"
      settingName: "enableMonocleLayout"
      editable: true
    }
    ListElement {
      name: "Three Column"
      settingName: "enableThreeColumnLayout"
    }
    ListElement {
      name: "Spiral"
      settingName: "enableSpiralLayout"
    }
    ListElement {
      name: "Spread"
      settingName: "enableSpreadLayout"
    }
    ListElement {
      name: "Stair"
      settingName: "enableStairLayout"
    }
    ListElement {
      name: "Quarter"
      settingName: "enableQuarterLayout"
    }
    ListElement {
      name: "Floating"
      settingName: "enableFloatingLayout"
    }
  }

  KCM.ScrollView {
    anchors.fill: parent

    view: ListView {
      model: layoutsModel

      delegate: Kirigami.SwipeListItem {
        contentItem: RowLayout {
          RowLayout {
            BIC.ConfigCheckBox {
              id: layoutCheckBox
              settingName: model.settingName
            }

            QQC2.Label {
              text: `${model.name} Layout`
            }
          }
        }
        actions: [
          Kirigami.Action {
            id: editLayout
            enabled: model.editable && layoutCheckBox.checked
            visible: model.editable
            iconName: "edit-rename"
            tooltip: i18nc("@info:tooltip", "Edit Layout")
            onTriggered: () => {
              monocleSheet.open()
            }
          }
        ]
      }
    }
  }

  MonocleOverlay {
    id: monocleSheet
    parent: root // Without this, overlay does not work
  }
}
