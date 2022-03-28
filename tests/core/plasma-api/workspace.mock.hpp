// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QObject>

namespace KWin
{
class AbstractClient;
}

class FakeKWinWorkspace : public QObject
{
    Q_OBJECT

public:
Q_SIGNALS:
    void numberScreensChanged(int count);
    void screenResized(int screen);
    void currentActivityChanged(const QString &id);
    void clientAdded(KWin::AbstractClient *);
    void clientMaximizeSet(KWin::AbstractClient *, bool h, bool v);
    void clientMinimized(KWin::AbstractClient *);
    void clientRemoved(KWin::AbstractClient *);
    void clientUnminimized(KWin::AbstractClient *);
    void currentDesktopChanged(int desktop, KWin::AbstractClient *kwinClient);
};
