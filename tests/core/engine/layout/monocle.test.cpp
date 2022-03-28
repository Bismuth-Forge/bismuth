// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include <doctest/doctest.h>

#include "config.mock.hpp"
#include "engine/layout/monocle.hpp"
#include "engine/window.hpp"

#include "plasma-api/client.hpp"
#include "plasma-api/client.mock.hpp"
#include "plasma-api/workspace.hpp"
#include "plasma-api/workspace.mock.hpp"

TEST_CASE("Monocle Tiling Logic")
{
    auto config = FakeConfig();
    auto monocleLayout = Bismuth::Monocle(config);

    auto fakeKWinWorkspace = FakeKWinWorkspace();
    auto workspace = PlasmaApi::Workspace(&fakeKWinWorkspace);

    auto fakeClient1 = FakeKWinClient();
    fakeClient1.m_frameGeometry = QRect(15, 42, 48, 67);

    auto fakeClient2 = FakeKWinClient();
    fakeClient1.m_frameGeometry = QRect(18, 24, 79, 10);

    auto tilingArea = QRect(0, 0, 1000, 1000);
    auto windowsToTile = std::vector<Bismuth::Window>({
        Bismuth::Window(PlasmaApi::Client(&fakeClient1), workspace),
        Bismuth::Window(PlasmaApi::Client(&fakeClient2), workspace),
    });

    monocleLayout.apply(tilingArea, windowsToTile);

    for (auto &window : windowsToTile) {
        CHECK(window.geometry() == tilingArea);
    }
}
