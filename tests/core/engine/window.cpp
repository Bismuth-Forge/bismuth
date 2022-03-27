// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include <doctest/doctest.h>

#include <QObject>

#include "engine/surface.hpp"
#include "engine/window.hpp"
#include "plasma-api/client.hpp"

#include "plasma-api/client.mock.hpp"

TEST_CASE("Window Visibility")
{
    auto fakeKWinClient = FakeKWinClient();
    auto client = PlasmaApi::Client(&fakeKWinClient);
    auto window = Bismuth::Window(client);

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
