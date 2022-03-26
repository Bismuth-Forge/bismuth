// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QString>

namespace Bismuth
{
struct Surface {
    Surface(int desktop, int screen, const QString &activity);

    int desktop() const;
    int screen() const;
    QString activity() const;

private:
    int m_desktop;
    int m_screen;
    QString m_activity;
};
}
