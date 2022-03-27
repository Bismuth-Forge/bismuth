// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include "layout.hpp"

namespace Bismuth
{
struct Stacked : Layout {
    virtual void apply(QRect area, std::vector<Window> &windows) const override;
};
}
