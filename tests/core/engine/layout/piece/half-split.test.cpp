// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include <doctest/doctest.h>
#include <memory>
#include <ostream>

#include "config.mock.hpp"
#include "helpers.hpp"

#include "config.hpp"
#include "engine/layout/piece/fill.hpp"
#include "engine/layout/piece/half-split.hpp"

TEST_CASE("Half-Split Piece")
{
    auto fakeConfig = FakeConfig();
    auto halfSplitPiece = Bismuth::HalfSplitPiece( //
        std::make_unique<Bismuth::FillPiece>(fakeConfig),
        std::make_unique<Bismuth::FillPiece>(fakeConfig));
    auto area = QRectF(0, 0, 100, 100);

    SUBCASE("Does nothing with no window groups")
    {
        // Arrange
        auto groups = std::vector<Bismuth::WindowGroup *>();

        // Act
        auto result = halfSplitPiece.apply(area, groups);

        // Assert
        CHECK(result.empty());
    }

    SUBCASE("Master = 1, Split ratio = 0.5")
    {
        SUBCASE("Places one window group across the whole area")
        {
            // Arrange
            auto windowGroup = Bismuth::WindowGroup(QRectF(), fakeConfig);
            auto groups = std::vector<Bismuth::WindowGroup *>({&windowGroup});

            // Act
            auto result = halfSplitPiece.apply(area, groups);

            // Assert
            CHECK(!result.empty());
            CHECK(result[&windowGroup] == area);
        }

        SUBCASE("Places two window groups nearby")
        {
            // Arrange
            auto group1 = Bismuth::WindowGroup(QRectF(), fakeConfig);
            auto group2 = Bismuth::WindowGroup(QRectF(), fakeConfig);
            auto groups = std::vector<Bismuth::WindowGroup *>({&group1, &group2});

            // Act
            auto result = halfSplitPiece.apply(area, groups);

            // Assert
            CHECK(!result.empty());
            CHECK(result[&group1] == area.adjusted(0, 0, -area.width() / 2, 0));
            CHECK(result[&group2] == area.adjusted(area.width() / 2, 0, 0, 0));
        }

        SUBCASE("Places 1 window group into master area, 2 window groups into secondary area")
        {
        }
    }
}
