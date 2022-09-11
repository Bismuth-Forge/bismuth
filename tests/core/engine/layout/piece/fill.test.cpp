// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "engine/layout/piece/fill.hpp"
#include "config.hpp"
#include "engine/window-group.hpp"
#include "plasma-api/window.hpp"
#include "plasma-api/window.mock.hpp"

#include <doctest/doctest.h>
#include <vector>

TEST_CASE("Fill Piece")
{
    auto fakeConfig = Bismuth::Config();
    auto fillPiece = Bismuth::FillPiece(fakeConfig);
    auto area = QRectF(0, 0, 100, 100);

    SUBCASE("Does nothing with empty window list")
    {
        // Arrange
        auto groups = std::vector<Bismuth::WindowGroup *>();

        // Act
        auto result = fillPiece.apply(area, groups);

        // Assert
        CHECK(result.empty());
    }

    SUBCASE("Tiles the single window across the whole area")
    {
        // Arrange
        auto groups = std::vector<Bismuth::WindowGroup *>();
        auto windowGroup = Bismuth::WindowGroup(QRectF(), fakeConfig);

        groups.push_back(&windowGroup);

        // Act
        auto result = fillPiece.apply(area, groups);

        // Assert
        CHECK(!result.empty());
        CHECK(result.begin()->second == area);
    }

    SUBCASE("Tiles multiple windows across the area")
    {
        // Arrange
        auto groups = std::vector<Bismuth::WindowGroup *>({
            new Bismuth::WindowGroup(QRectF(), fakeConfig),
            new Bismuth::WindowGroup(QRectF(), fakeConfig),
            new Bismuth::WindowGroup(QRectF(), fakeConfig),
        });

        // Act
        auto result = fillPiece.apply(area, groups);

        // Assert
        CHECK(!result.empty());
        for (auto &pair : result) {
            CHECK(pair.second == area);
        }

        for (auto i : groups) {
            delete i;
        }
        groups.clear();
    }
}
