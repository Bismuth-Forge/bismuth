// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <memory>

#include "angle-dependent.hpp"

namespace Bismuth
{
class Config;

struct HalfSplitPiece : AngleDependentPiece {
    HalfSplitPiece(std::unique_ptr<LayoutPiece> &&primary, std::unique_ptr<LayoutPiece> &&secondary);

    virtual std::unordered_map<WindowGroup *, QRectF> apply(const QRectF &area, const std::vector<WindowGroup *> &groups) override;

private:
    std::unique_ptr<LayoutPiece> m_primary;
    std::unique_ptr<LayoutPiece> m_secondary;

    qreal m_primarySize{1};
    qreal m_ratio{0.5};
};

}
