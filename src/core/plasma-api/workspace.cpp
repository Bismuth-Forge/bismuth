// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@genda.life>
// SPDX-License-Identifier: MIT

#include "workspace.hpp"

#include <doctest/doctest.h>

#include "plasma-api/plasma-api.hpp"

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

namespace Test
{

TEST_CASE("Workspace Properties Read")
{
    auto engine = QQmlEngine();
    auto mockWorkspace = MockWorkspaceJS();

    engine.globalObject().setProperty(QStringLiteral("workspace"), engine.newQObject(&mockWorkspace));

    auto plasmaApi = ::PlasmaApi::PlasmaApi(&engine);
    auto workspace = plasmaApi.workspace();

    SUBCASE("currentDesktop")
    {
        auto result = workspace.currentDesktop();
        CHECK(result == 42);
    }
}
}

}
