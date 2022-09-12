// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include <doctest/doctest.h>
#include <vector>

#include "engine/layout/utils.hpp"
#include "helpers.hpp"

TEST_CASE("Layout utils: Slice")
{
    auto vec = std::vector<int>{1, 2, 3, 4, 5, 6};

    // std::vector<T> slice(const std::vector<T> &vec, size_t begin, int16_t end = -1)
    SUBCASE("Slice from start")
    {
        auto result = Bismuth::slice(vec, 0, 2);

        CHECK(result == std::vector<int>{1, 2});
    }

    SUBCASE("Slice to the end")
    {
        auto result = Bismuth::slice(vec, 1);

        CHECK(result == std::vector<int>{2, 3, 4, 5, 6});
    }

    SUBCASE("Central slice")
    {
        auto result = Bismuth::slice(vec, 2, 4);

        CHECK(result == std::vector<int>{3, 4});
    }
}
