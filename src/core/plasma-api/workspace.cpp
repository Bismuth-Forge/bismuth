// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@genda.life>
// SPDX-License-Identifier: MIT

#include "workspace.hpp"

#include <doctest/doctest.h>

#include "plasma-api/plasma-api.hpp"

namespace PlasmaApi
{

Workspace::Workspace(QQmlEngine *engine)
    : m_engine(engine)
    , m_kwinImpl(engine->globalObject().property("workspace").toQObject())
{
}

int Workspace::currentDesktop()
{
    return m_kwinImpl->property("currentDesktop").value<int>();
}

void Workspace::setCurrentDesktop(int desktop)
{
    m_kwinImpl->setProperty("currentDesktop", QVariant::fromValue(desktop));
}

namespace Test
{

TEST_CASE("Workspace Properties Read")
{
    auto engine = QQmlEngine();
    auto mockWorkspace = MockWorkspaceJS();
    mockWorkspace.setCurrentDesktop(42);

    engine.globalObject().setProperty(QStringLiteral("workspace"), engine.newQObject(&mockWorkspace));

    auto plasmaApi = ::PlasmaApi::PlasmaApi(&engine);
    auto workspace = plasmaApi.workspace();

    SUBCASE("currentDesktop")
    {
        auto result = workspace.currentDesktop();
        CHECK(result == 42);
    }
}

TEST_CASE("Workspace Properties Write")
{
    auto engine = QQmlEngine();
    auto mockWorkspace = MockWorkspaceJS();

    engine.globalObject().setProperty(QStringLiteral("workspace"), engine.newQObject(&mockWorkspace));

    auto plasmaApi = ::PlasmaApi::PlasmaApi(&engine);
    auto workspace = plasmaApi.workspace();

    workspace.setCurrentDesktop(67);

    SUBCASE("currentDesktop")
    {
        auto result = workspace.currentDesktop();
        CHECK(result == 67);
    }
}

}

}
