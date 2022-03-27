// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "monocle.hpp"

namespace Bismuth
{
void Monocle::apply(QRect area, std::vector<Window> &windows) const
{
    for (auto &window : windows) {
        // Place the window on the all available area
        window.setGeometry(area);
    }
}
}
