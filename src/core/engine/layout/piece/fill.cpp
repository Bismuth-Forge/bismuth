// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "fill.hpp"

namespace Bismuth
{
std::unordered_map<WindowGroup *, QRectF> FillPiece::apply(const QRectF &area, const std::vector<WindowGroup *> &groups)
{
    auto result = std::unordered_map<WindowGroup *, QRectF>();
    for (auto group : groups) {
        result[group] = area;
    }
    return result;
}

}
