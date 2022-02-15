// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@genda.life>
// SPDX-License-Identifier: MIT

#pragma once

#include <QObject>
#include <QQmlEngine>

namespace PlasmaApi
{
struct Workspace {
    Workspace(QQmlEngine *engine);

    int currentDesktop();

private:
    QQmlEngine *m_engine;
    QObject *m_kwinImpl;
};

namespace Test
{
class MockWorkspaceJS : public QObject
{
    Q_OBJECT
    Q_PROPERTY(int currentDesktop READ currentDesktop WRITE setCurrentDesktop)
public:
    int currentDesktop()
    {
        return m_currentDesktop;
    }

    void setCurrentDesktop(int desktop)
    {
        m_currentDesktop = desktop;
    }

    int m_currentDesktop{};
};
}

}
