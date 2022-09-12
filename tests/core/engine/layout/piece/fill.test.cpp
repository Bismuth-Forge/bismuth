// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include <doctest/doctest.h>
#include <vector>

#include "config.mock.hpp"

#include "engine/layout/piece/fill.hpp"
#include "engine/window-group.hpp"
#include "plasma-api/window.hpp"
#include "plasma-api/window.mock.hpp"

TEST_CASE("Fill Piece")
{
    auto fakeConfig = FakeConfig();
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
        auto windowGroup = Bismuth::WindowGroup(QRectF(), fakeConfig);

        auto groups = std::vector<Bismuth::WindowGroup *>({&windowGroup});

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
        auto group1 = Bismuth::WindowGroup(QRectF(), fakeConfig);
        auto group2 = Bismuth::WindowGroup(QRectF(), fakeConfig);
        auto group3 = Bismuth::WindowGroup(QRectF(), fakeConfig);

        auto groups = std::vector<Bismuth::WindowGroup *>({
            &group1,
            &group2,
            &group3,
        });

        // Act
        auto result = fillPiece.apply(area, groups);

        // Assert
        CHECK(!result.empty());
        for (auto &pair : result) {
            CHECK(pair.second == area);
        }
    }
}
