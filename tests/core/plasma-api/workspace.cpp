// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@genda.life>
// SPDX-License-Identifier: MIT

#include <doctest/doctest.h>

#include <QQmlContext>
#include <QQmlEngine>

#include "plasma-api/plasma-api.hpp"

class MockWorkspaceJS : public QObject
{
    Q_OBJECT
    Q_PROPERTY(int currentDesktop READ currentDesktop)
public:
    int currentDesktop()
    {
        return 42;
    }
};

TEST_CASE("Workspace Properties Read")
{
    auto engine = QQmlEngine();
    auto mockWorkspace = MockWorkspaceJS();

    engine.globalObject().setProperty(QStringLiteral("workspace"), engine.newQObject(&mockWorkspace));

    auto plasmaApi = PlasmaApi::PlasmaApi(&engine);
    auto workspace = plasmaApi.workspace();

    SUBCASE("currentDesktop")
    {
        auto result = workspace.currentDesktop();
        CHECK(result == 42);
    }
}

#include "workspace.moc"
