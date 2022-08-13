// SPDX-FileCopyrightText: 2018-2019 Eon S. Jeon <esjeon@hyunmu.am>
// SPDX-FileCopyrightText: 2021-2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

import QtQuick 2.0
import org.kde.bismuth.core 1.0 as BiCore
import org.kde.kwin 2.0

Item {
    id: root

    Component.onCompleted: {
        core.init();
    }

    BiCore.Core {
        id: core
    }

}
