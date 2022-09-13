// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include <doctest/doctest.h>

#include "config.mock.hpp"
#include "engine/layout/piece/stack.hpp"
#include "engine/window-group.hpp"
#include "helpers.hpp"

TEST_CASE("Stack Piece")
{
    auto config = FakeConfig();
    auto stack = Bismuth::StackPiece(config);
    auto area = QRectF(0, 0, 100, 100);

    SUBCASE("Does nothing when there is no window groups")
    {
        auto groups = std::vector<Bismuth::WindowGroup *>();

        auto result = stack.apply(area, groups);

        CHECK(result.empty());
    }

    SUBCASE("Puts 1 window across the whole area")
    {
        auto group1 = Bismuth::WindowGroup(QRectF(), config);
        auto groups = std::vector<Bismuth::WindowGroup *>({&group1});

        auto result = stack.apply(area, groups);

        REQUIRE_FALSE(result.empty());
        CHECK_EQ(result[&group1], area);
    }

    SUBCASE("Puts 2 windows into the vertical stack")
    {
        auto group1 = Bismuth::WindowGroup(QRectF(), config);
        auto group2 = Bismuth::WindowGroup(QRectF(), config);
        auto groups = std::vector<Bismuth::WindowGroup *>({&group1, &group2});

        auto result = stack.apply(area, groups);

        REQUIRE_FALSE(result.empty());
        CHECK_EQ(result[&group1], QRectF(0, 0, 100, 50));
        CHECK_EQ(result[&group2], QRectF(0, 50, 100, 50));
    }

    SUBCASE("Puts 4 windows into the vertical stack")
    {
        auto group1 = Bismuth::WindowGroup(QRectF(), config);
        auto group2 = Bismuth::WindowGroup(QRectF(), config);
        auto group3 = Bismuth::WindowGroup(QRectF(), config);
        auto group4 = Bismuth::WindowGroup(QRectF(), config);
        auto groups = std::vector<Bismuth::WindowGroup *>({&group1, &group2, &group3, &group4});

        auto result = stack.apply(area, groups);

        REQUIRE_FALSE(result.empty());
        CHECK_EQ(result[&group1], QRectF(0, 0, 100, 25));
        CHECK_EQ(result[&group2], QRectF(0, 25, 100, 25));
        CHECK_EQ(result[&group3], QRectF(0, 50, 100, 25));
        CHECK_EQ(result[&group4], QRectF(0, 75, 100, 25));
    }
}
