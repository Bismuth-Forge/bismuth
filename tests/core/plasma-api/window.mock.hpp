// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QObject>
#include <QRect>
#include <QStringList>

class FakeKWinClient : public QObject
{
    Q_OBJECT

    Q_PROPERTY(bool minimized MEMBER m_minimized)
    Q_PROPERTY(bool onAllDesktops MEMBER m_onAllDesktops)
    Q_PROPERTY(int desktop MEMBER m_desktop)
    Q_PROPERTY(int screen MEMBER m_screen)
    Q_PROPERTY(QStringList activities MEMBER m_activities)
    Q_PROPERTY(QRect frameGeometry MEMBER m_frameGeometry)

public:
    FakeKWinClient &operator=(const FakeKWinClient &);

    bool m_minimized{};
    bool m_onAllDesktops{};
    int m_desktop{};
    int m_screen{};
    QStringList m_activities{};
    QRect m_frameGeometry{};
};
