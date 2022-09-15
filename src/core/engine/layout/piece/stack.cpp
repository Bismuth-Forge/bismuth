// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "stack.hpp"
#include "config.hpp"
#include "engine/layout/utils.hpp"
#include "logger.hpp"

namespace Bismuth
{
StackPiece::StackPiece(const Bismuth::Config &config)
    : LayoutPiece(config)
{
}

std::unordered_map<WindowGroup *, QRectF> StackPiece::apply(const QRectF &area, const std::vector<WindowGroup *> &groups)
{
    auto splittedAreas = AreaSplitter(m_config.tileLayoutGap()).splitAreaWeighted(area, groupsWeights(groups));

    auto result = std::unordered_map<WindowGroup *, QRectF>();
    for (auto i = 0; i < groups.size(); i++) {
        result[groups[i]] = splittedAreas[i];
    }

    return result;
}
}
