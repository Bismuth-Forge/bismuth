// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "layout_list.hpp"

#include <functional>
#include <memory>

#include "engine/layout/layout.hpp"
#include "engine/layout/monocle.hpp"
#include "engine/layout/stacked.hpp"
#include "engine/surface.hpp"

namespace Bismuth
{

const Layout &LayoutList::layoutOnSurface(const Surface &surface)
{
    auto it = m_layouts.find(surface);

    if (it == m_layouts.end()) {
        auto [it2, _] = m_layouts.insert_or_assign(surface, std::make_unique<Monocle>());
        it = it2;
    }

    return *it->second;
}
}
