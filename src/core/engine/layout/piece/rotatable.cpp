// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "rotatable.hpp"
#include "config.hpp"
#include "logger.hpp"

namespace Bismuth
{

RotatablePiece::RotatablePiece(std::unique_ptr<LayoutPiece> &&inner)
    : AngleDependentPiece(inner->config())
    , m_inner(std::move(inner))
{
}

std::unordered_map<WindowGroup *, QRectF> RotatablePiece::apply(const QRectF &area, const std::vector<WindowGroup *> &groups)
{
    auto rotatedArea = area;
    switch (m_angle) {
    case 0:
        break;
    case 90:
        rotatedArea = QRectF(area.y(), area.x(), area.height(), area.width());
        break;
    case 180:
        break;
    case 270:
        rotatedArea = QRectF(area.y(), area.x(), area.height(), area.width());
        break;
    }

    auto innerResult = m_inner->apply(area, groups);

    switch (m_angle) {
    case 0:
        return innerResult;
    case 90:
        for (auto &[_, rect] : innerResult) {
            rect = QRectF(rect.y(), rect.x(), rect.height(), rect.width());
        }
    case 180:
        for (auto &[_, rect] : innerResult) {
            auto rx = rect.x() - area.x();
            auto newX = area.x() + area.width() - (rx + rect.width());

            rect = QRectF(newX, rect.y(), rect.width(), rect.height());
        }
    case 270:
        for (auto &[_, rect] : innerResult) {
            auto rx = rect.x() - area.x();
            auto newY = area.x() + area.width() - (rx + rect.width());

            rect = QRectF(rect.y(), newY, rect.height(), rect.width());
        }
    }

    return innerResult;
}
}
