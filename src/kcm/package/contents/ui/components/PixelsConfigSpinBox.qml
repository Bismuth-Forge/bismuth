// SPDX-FileCopyrightText: 2021 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

import QtQuick 2.12
import QtQuick.Controls 2.12 as QQC2
import QtQuick.Layouts 1.15
import org.kde.kirigami 2.7 as Kirigami

ConfigSpinBox {
    textFromValue: (value, _locale) => {
        return `${Number(value).toLocaleString(locale, 'f', 0)} px`;
    }
    valueFromText: (text, locale) => {
        return Number.fromLocaleString(locale, text.replace(" px", ""));
    }
    // Pixels are always positive
    from: 0
    to: 512
    editable: true
}
