// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QRect>

#include <iterator>
#include <ostream>
#include <sstream>
#include <vector>

#include <doctest/doctest.h>

std::ostream &operator<<(std::ostream &os, const QRectF &value);
std::ostream &operator<<(std::ostream &os, const QRect &value);

namespace doctest
{
template<typename T>
struct StringMaker<std::vector<T>> {
    static String convert(const std::vector<T> &in)
    {
        std::ostringstream oss;

        oss << "[";
        for (auto it = in.begin(); it != in.end(); ++it) {
            oss << *it;
            if (it != std::prev(in.end())) {
                oss << ", ";
            }
        }
        oss << "]";

        return oss.str().c_str();
    }
};
}
