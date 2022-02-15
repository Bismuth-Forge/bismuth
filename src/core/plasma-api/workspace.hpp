// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QObject>
#include <QQmlEngine>

#include "plasma-api/client.hpp"

#include "utils.hpp"

// Forward declare KWin Classes
namespace KWin
{
class AbstractClient;
}

namespace PlasmaApi
{
class Workspace : public QObject
{
    Q_OBJECT
public:
    Workspace(QQmlEngine *engine);
    Workspace(const Workspace &);

    BI_PROPERTY(int, currentDesktop, setCurrentDesktop);

public Q_SLOTS:
    void currentDesktopChangedTransformer(int desktop, KWin::AbstractClient *kwinClient);

Q_SIGNALS:
    void currentDesktopChanged(int desktop, PlasmaApi::Client kwinClient);

private:
    void wrapSignals();

    QQmlEngine *m_engine;
    QObject *m_kwinImpl;
};

}
