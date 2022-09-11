// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include "piece.hpp"

namespace Bismuth
{
class Config;

struct StackPiece : LayoutPiece {
    StackPiece(const Bismuth::Config &config);

    virtual std::unordered_map<WindowGroup *, QRectF> apply(const QRectF &area, const std::vector<WindowGroup *> &groups) override;
};
}
