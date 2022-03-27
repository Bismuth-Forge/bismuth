// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "layout_list.hpp"
#include "engine/layout/stacked.hpp"
#include <memory>

namespace Bismuth
{

const Layout &LayoutList::layoutOnSurface(const Surface &surface) const
{
    auto &layout = m_layouts.at(surface);

    if (layout) {
        return *layout;
    } else {
        // m_layouts.emplace(Surface(surface), std::make_unique<Stacked>());
        return *m_layouts.at(surface);
    }
}

}
