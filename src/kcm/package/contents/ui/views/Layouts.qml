// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

import "../components" as BIC
import QtQuick 2.12
import QtQuick.Controls 2.12 as QQC2
import QtQuick.Layouts 1.15
import org.kde.kcm 1.5 as KCM
import org.kde.kirigami 2.7 as Kirigami

Kirigami.Page {
    id: root

    title: "Window Layouts"

    ListModel {
        id: layoutsModel

        ListElement {
            name: "Master-Stack"
            settingName: "enableMasterStackLayout"
        }

        ListElement {
            name: "Tabbed"
            settingName: "enableTabbedLayout"
            editable: true
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
                actions: [
                    Kirigami.Action {
                        id: editLayout

                        enabled: model.editable && layoutCheckBox.checked
                        visible: model.editable
                        iconName: "edit-rename"
                        tooltip: i18nc("@info:tooltip", "Edit Layout")
                        onTriggered: () => {
                            monocleSheet.open();
                        }
                    }
                ]

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

            }

        }

    }

    TabbedLayoutOverlay {
        id: monocleSheet

        parent: root // Without this, overlay does not work
    }

}
