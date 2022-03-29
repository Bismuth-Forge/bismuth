// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include <doctest/doctest.h>

#include <QObject>
#include <QString>

#include "engine/surface.hpp"
#include "engine/window.hpp"
#include "plasma-api/client.hpp"

#include "plasma-api/client.mock.hpp"
#include "plasma-api/workspace.hpp"
#include "plasma-api/workspace.mock.hpp"

TEST_CASE("Window Visibility")
{
    auto fakeKWinClient = FakeKWinClient();
    auto fakeKwinWorkspace = FakeKWinWorkspace();
    auto client = PlasmaApi::Client(&fakeKWinClient);
    auto workspace = PlasmaApi::Workspace(&fakeKwinWorkspace);
    auto window = Bismuth::Window(client, workspace);

    SUBCASE("Minimized window")
    {
        auto surface = Bismuth::Surface(0, 0, "");

        fakeKWinClient = FakeKWinClient();
        fakeKWinClient.m_minimized = true;
        fakeKWinClient.m_desktop = 1;

        auto visible = window.visibleOn(surface);

        CHECK(visible == false);
    }

    SUBCASE("Window on another desktop")
    {
        auto surface = Bismuth::Surface(0, 0, "");

        fakeKWinClient = FakeKWinClient();
        fakeKWinClient.m_desktop = 2;

        auto visible = window.visibleOn(surface);

        CHECK(visible == false);
    }

    SUBCASE("Window on another screen")
    {
        auto surface = Bismuth::Surface(0, 0, "");

        fakeKWinClient = FakeKWinClient();
        fakeKWinClient.m_screen = 1;

        auto visible = window.visibleOn(surface);

        CHECK(visible == false);
    }

    SUBCASE("Window on another activity")
    {
        auto surface = Bismuth::Surface(0, 0, "abc");

        fakeKWinClient = FakeKWinClient();
        fakeKWinClient.m_activities = QStringList("xyz");

        auto visible = window.visibleOn(surface);

        CHECK(visible == false);
    }

    SUBCASE("Window is on current screen, activity and desktop")
    {
        auto surface = Bismuth::Surface(3, 1, "abc");

        fakeKWinClient = FakeKWinClient();
        fakeKWinClient.m_activities = QStringList("abc");
        fakeKWinClient.m_screen = 1;
        fakeKWinClient.m_desktop = 3;

        auto visible = window.visibleOn(surface);

        CHECK(visible == true);
    }

    SUBCASE("Window is on current screen and activity, but on all desktops")
    {
        auto surface = Bismuth::Surface(3, 1, "abc");

        fakeKWinClient = FakeKWinClient();
        fakeKWinClient.m_activities = QStringList("abc");
        fakeKWinClient.m_onAllDesktops = true;
        fakeKWinClient.m_screen = 1;

        auto visible = window.visibleOn(surface);

        CHECK(visible == true);
    }

    SUBCASE("Window is on current screen, but on all desktops and activities")
    {
        auto surface = Bismuth::Surface(3, 1, "abc");

        fakeKWinClient = FakeKWinClient();
        fakeKWinClient.m_onAllDesktops = true;
        fakeKWinClient.m_screen = 1;

        auto visible = window.visibleOn(surface);

        CHECK(visible == true);
    }
}

TEST_CASE("Desktops List")
{
    auto fakeKWinClient = FakeKWinClient();
    auto fakeKWinWorkspace = FakeKWinWorkspace();
    auto client = PlasmaApi::Client(&fakeKWinClient);
    auto workspace = PlasmaApi::Workspace(&fakeKWinWorkspace);
    auto window = Bismuth::Window(client, workspace);

    SUBCASE("Window on one desktop")
    {
        fakeKWinClient = FakeKWinClient();
        fakeKWinClient.m_desktop = 2;
        fakeKWinClient.m_onAllDesktops = false;

        auto desktops = window.desktops();

        CHECK(desktops.size() == 1);
        CHECK(desktops.front() == 2);
    }

    SUBCASE("Window on all desktops")
    {
        fakeKWinClient = FakeKWinClient();
        fakeKWinClient.m_onAllDesktops = true;

        fakeKWinWorkspace = FakeKWinWorkspace();
        fakeKWinWorkspace.m_numberOfDesktops = 2;

        auto desktops = window.desktops();

        CHECK(desktops.size() == 2);
        CHECK(desktops.front() == 1);
        CHECK(desktops.back() == 2);
    }
}

TEST_CASE("Activities List")
{
    auto fakeKWinClient = FakeKWinClient();
    auto fakeKWinWorkspace = FakeKWinWorkspace();
    auto client = PlasmaApi::Client(&fakeKWinClient);
    auto workspace = PlasmaApi::Workspace(&fakeKWinWorkspace);
    auto window = Bismuth::Window(client, workspace);

    SUBCASE("Window on one activity")
    {
        fakeKWinClient = FakeKWinClient();
        fakeKWinClient.m_activities = QStringList({"stone-ocean"});

        auto activities = window.activities();

        CHECK(activities.size() == 1);
        CHECK(activities.front() == QStringLiteral("stone-ocean"));
    }

    SUBCASE("Window on two activities")
    {
        fakeKWinClient = FakeKWinClient();
        fakeKWinClient.m_activities = QStringList({"stone-ocean", "diamond-is-unbreakable"});

        auto activities = window.activities();

        CHECK(activities.size() == 2);
        CHECK(activities.front() == QStringLiteral("stone-ocean"));
        CHECK(activities.back() == QStringLiteral("diamond-is-unbreakable"));
    }

    SUBCASE("Window on all activities")
    {
        fakeKWinClient = FakeKWinClient();
        fakeKWinClient.m_activities = QStringList();

        fakeKWinWorkspace.m_activities = QStringList({"stone-ocean", "diamond-is-unbreakable"});

        auto activities = window.activities();

        CHECK(activities.size() == 2);
        CHECK(activities.front() == QStringLiteral("stone-ocean"));
        CHECK(activities.back() == QStringLiteral("diamond-is-unbreakable"));
    }
}
