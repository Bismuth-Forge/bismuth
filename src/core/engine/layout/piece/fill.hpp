// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <unordered_map>

#include "engine/window-group.hpp"
#include "piece.hpp"

namespace Bismuth
{
struct FillPiece : LayoutPiece {
    using LayoutPiece::LayoutPiece;

    virtual std::unordered_map<WindowGroup *, QRectF> apply(const QRectF &area, const std::vector<WindowGroup *> &groups) override;
};

}
