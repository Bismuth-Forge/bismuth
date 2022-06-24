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

// Mock KWin Objects. This is for tests only.
namespace KWin
{
class Window
{
};
}

Q_DECLARE_METATYPE(KWin::Window *)

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

Q_SIGNALS:
    void currentDesktopChanged(int desktop, KWin::Window *client);
    // Not all signals are used, some of them declared to avoid warnings
    void numberScreensChanged(int);
    void screenResized(int);
    void currentActivityChanged(const QString &);
    void clientAdded(KWin::Window *);
    void clientRemoved(KWin::Window *);
    void clientMinimized(KWin::Window *);
    void clientUnminimized(KWin::Window *);
    void clientMaximizeSet(KWin::Window *, bool, bool);

private:
    int m_currentDesktop{};
};

TEST_CASE("Workspace Properties Read")
{
    auto engine = QQmlEngine();
    auto mockWorkspace = MockWorkspaceJS();
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
    auto mockWorkspace = MockWorkspaceJS();

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
    auto mockWorkspace = MockWorkspaceJS();

    engine.rootContext()->setContextProperty(QStringLiteral("workspace"), &mockWorkspace);

    auto plasmaApi = ::PlasmaApi::Api(&engine);
    auto workspace = plasmaApi.workspace();

    SUBCASE("currentDesktop")
    {
        qRegisterMetaType<KWin::Window *>();
        auto signalSpy = QSignalSpy(&workspace, SIGNAL(currentDesktopChanged(int, PlasmaApi::Window)));
        auto mockKWinClient = KWin::Window();

        // Act
        Q_EMIT mockWorkspace.currentDesktopChanged(69, &mockKWinClient);

        // Assert
        CHECK(signalSpy.count() == 1);

        auto signal = signalSpy.takeFirst();
        auto desktopNum = signal.at(0).value<int>();
        auto clientVariant = signal.at(1);

        CHECK(desktopNum == 69);
        CHECK(clientVariant.canConvert<PlasmaApi::Window>());
    }
}

#include "workspace.test.moc"
