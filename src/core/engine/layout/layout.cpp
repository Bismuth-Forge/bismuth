// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "layout.hpp"

namespace Bismuth
{
Layout::Layout(const Bismuth::Config &config)
    : m_config(config)
{
}

QRect Layout::tilingArea(QRect workingArea, std::vector<Window> &windows) const
{
    if (windows.size() == 1 && m_config.smartGaps()) {
        return workingArea;
    }

    auto marginLeft = m_config.screenGapLeft();
    auto marginTop = m_config.screenGapTop();
    auto marginRight = m_config.screenGapRight();
    auto marginBottom = m_config.screenGapBottom();

    return workingArea.adjusted(+marginLeft, +marginTop, -marginRight, -marginBottom);
}
}
