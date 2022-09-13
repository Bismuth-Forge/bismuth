// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include <doctest/doctest.h>
#include <vector>

#include "engine/layout/utils.hpp"
#include "helpers.hpp"

TEST_SUITE("Layout Utils")
{
    TEST_CASE("Array Slice")
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

        SUBCASE("No result when range is invalid")
        {
            auto result = Bismuth::slice(vec, 2, 1);

            CHECK(result.empty());
        }
    }

    TEST_CASE("Area Splitter")
    {
        SUBCASE("No gaps")
        {
            SUBCASE("Line Segment Split")
            {
                auto splitter = Bismuth::AreaSplitter();

                auto lineSegment = Bismuth::LineSegment{0, 100};
                auto weights = std::vector<qreal>{0.25, 0.25, 0.5};

                auto result = splitter.splitSegmentWeighted(lineSegment, weights);

                CHECK_EQ(result.size(), 3);
                CHECK_EQ(result[0], Bismuth::LineSegment{0, 25});
                CHECK_EQ(result[1], Bismuth::LineSegment{25, 25});
                CHECK_EQ(result[2], Bismuth::LineSegment{50, 50});
            }

            SUBCASE("Vertical Split")
            {
                auto splitter = Bismuth::AreaSplitter();
                auto area = QRectF(0, 0, 100, 100);

                SUBCASE("Split Area Weighted")
                {
                    auto weights = std::vector<qreal>{0.25, 0.25, 0.5};

                    auto result = splitter.splitAreaWeighted(area, weights);

                    CHECK_EQ(result.size(), 3);
                    CHECK_EQ(result[0], QRectF(0, 0, 100, 25));
                    CHECK_EQ(result[1], QRectF(0, 25, 100, 25));
                    CHECK_EQ(result[2], QRectF(0, 50, 100, 50));
                }

                SUBCASE("Split Area in Two Parts with Primary Weight")
                {
                    auto result = splitter.splitAreaIntoTwoPartsWithPrimaryWeight(area, 0.25);

                    CHECK_EQ(result.first, QRectF(0, 0, 100, 25));
                    CHECK_EQ(result.second, QRectF(0, 25, 100, 75));
                }
            }

            SUBCASE("Horizontal Split")
            {
                auto splitter = Bismuth::AreaSplitter(0, Qt::Horizontal);
                auto area = QRectF(0, 0, 100, 100);

                SUBCASE("Split Area Weighted")
                {
                    auto weights = std::vector<qreal>{0.25, 0.25, 0.5};

                    auto result = splitter.splitAreaWeighted(area, weights);

                    CHECK_EQ(result.size(), 3);
                    CHECK_EQ(result[0], QRectF(0, 0, 25, 100));
                    CHECK_EQ(result[1], QRectF(25, 0, 25, 100));
                    CHECK_EQ(result[2], QRectF(50, 0, 50, 100));
                }

                SUBCASE("Split Area in Two Parts with Primary Weight")
                {
                    auto result = splitter.splitAreaIntoTwoPartsWithPrimaryWeight(area, 0.25);

                    CHECK_EQ(result.first, QRectF(0, 0, 25, 100));
                    CHECK_EQ(result.second, QRectF(25, 0, 75, 100));
                }
            }
        }
    }
}
