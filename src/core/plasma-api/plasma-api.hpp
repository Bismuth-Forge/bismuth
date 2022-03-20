// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QQmlEngine>

#include "workspace.hpp"

namespace PlasmaApi
{

/**
 * QML API Wrapper for KWin and Plasma
 */
struct PlasmaApi {
    explicit PlasmaApi(QQmlEngine *engine);

    Workspace &workspace();

private:
    QQmlEngine *m_engine;
    Workspace m_workspace;
};

}
