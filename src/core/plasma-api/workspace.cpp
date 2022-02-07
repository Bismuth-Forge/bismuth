// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@genda.life>
// SPDX-License-Identifier: MIT

#include "workspace.hpp"

namespace PlasmaApi
{

Workspace::Workspace(const QJSValue &jsRepr, QQmlEngine *engine)
    : m_jsRepr(jsRepr)
    , m_engine(engine)
{
}

int Workspace::currentDesktop()
{
    auto jsResult = m_jsRepr.property("currentDesktop");
    return jsResult.toInt();
}

}
