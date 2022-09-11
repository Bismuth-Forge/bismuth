// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QObject>

namespace KWin
{
class Window;

class Workspace : public QObject
{
    Q_OBJECT

    Q_PROPERTY(int currentDesktop READ currentDesktop WRITE setCurrentDesktop)
    Q_PROPERTY(int desktops MEMBER m_numberOfDesktops)
    Q_PROPERTY(QStringList activities MEMBER m_activities)

public:
    Workspace &operator=(const Workspace &);

    int currentDesktop()
    {
        return m_currentDesktop;
    }

    void setCurrentDesktop(int desktop)
    {
        m_currentDesktop = desktop;
    }

    int m_numberOfDesktops{};
    QStringList m_activities{};

Q_SIGNALS:
    void numberScreensChanged(int count);
    void screenResized(int screen);
    void currentActivityChanged(const QString &id);
    void clientAdded(KWin::Window *);
    void clientMaximizeSet(KWin::Window *, bool h, bool v);
    void clientMinimized(KWin::Window *);
    void clientRemoved(KWin::Window *);
    void clientUnminimized(KWin::Window *);
    void currentDesktopChanged(int desktop, KWin::Window *kwinClient);

private:
    int m_currentDesktop{};
};
}
