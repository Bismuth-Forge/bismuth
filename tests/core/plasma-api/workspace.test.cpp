// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include <doctest/doctest.h>

#include <QObject>
#include <QQmlContext>
#include <QQmlEngine>
#include <QSignalSpy>

#include "plasma-api/api.hpp"
#include "plasma-api/window.hpp"
#include "plasma-api/workspace.hpp"

#include "window.mock.hpp"
#include "workspace.mock.hpp"

TEST_CASE("Workspace Properties Read")
{
    auto engine = QQmlEngine();
    auto mockWorkspace = KWin::Workspace();
    mockWorkspace.setCurrentDesktop(42);

    engine.rootContext()->setContextProperty(QStringLiteral("workspace"), &mockWorkspace);

    auto plasmaApi = ::PlasmaApi::Api(&engine);
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
    auto mockWorkspace = KWin::Workspace();

    engine.rootContext()->setContextProperty(QStringLiteral("workspace"), &mockWorkspace);

    auto plasmaApi = ::PlasmaApi::Api(&engine);
    auto workspace = plasmaApi.workspace();

    workspace.setCurrentDesktop(67);

    SUBCASE("currentDesktop")
    {
        auto result = workspace.currentDesktop();
        CHECK(result == 67);
    }
}

TEST_CASE("Workspace Properties Signals")
{
    auto engine = QQmlEngine();
    auto mockWorkspace = KWin::Workspace();

    engine.rootContext()->setContextProperty(QStringLiteral("workspace"), &mockWorkspace);

    auto plasmaApi = ::PlasmaApi::Api(&engine);
    auto workspace = plasmaApi.workspace();

    SUBCASE("currentDesktop")
    {
        qRegisterMetaType<KWin::Window *>();
        auto signalSpy = QSignalSpy(&workspace, SIGNAL(currentDesktopChanged(int, std::optional<PlasmaApi::Window>)));
        auto mockKWinClient = KWin::Window();

        // Act
        Q_EMIT mockWorkspace.currentDesktopChanged(69, &mockKWinClient);

        // Assert
        CHECK(signalSpy.count() == 1);

        auto signal = signalSpy.takeFirst();
        auto desktopNum = signal.at(0).value<int>();
        auto clientVariant = signal.at(1);

        CHECK(desktopNum == 69);
        CHECK(clientVariant.canConvert<std::optional<PlasmaApi::Window>>());
    }
}
