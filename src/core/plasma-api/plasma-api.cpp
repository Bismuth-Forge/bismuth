// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@genda.life>
// SPDX-License-Identifier: MIT

#include "plasma-api.hpp"

#include <QQmlContext>

#include "plasma-api/workspace.hpp"

namespace PlasmaApi
{

PlasmaApi::PlasmaApi(QQmlEngine *engine)
    : m_engine(engine){};

Workspace PlasmaApi::workspace()
{
    auto evalResult = m_engine->globalObject().property("workspace");
    return Workspace(evalResult, m_engine);
}

}
