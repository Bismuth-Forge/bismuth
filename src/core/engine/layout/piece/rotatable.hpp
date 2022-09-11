// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <memory>

#include "angle-dependent.hpp"

namespace Bismuth
{
class WindowGroup;

struct RotatablePiece : AngleDependentPiece {
    RotatablePiece(std::unique_ptr<LayoutPiece> &&inner);

    virtual std::unordered_map<WindowGroup *, QRectF> apply(const QRectF &area, const std::vector<WindowGroup *> &groups) override;

private:
    std::unique_ptr<LayoutPiece> m_inner;
};
}
