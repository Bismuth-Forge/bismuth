// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "api.hpp"

#include <QQmlContext>

#include "plasma-api/workspace.hpp"

namespace PlasmaApi
{

Api::Api(QQmlEngine *engine)
    : m_engine(engine)
    , m_workspace(engine->rootContext()->contextProperty(QStringLiteral("workspace")).value<QObject *>())
{
    qRegisterMetaType<Client>();
};

Workspace &Api::workspace()
{
    return m_workspace;
}

}
