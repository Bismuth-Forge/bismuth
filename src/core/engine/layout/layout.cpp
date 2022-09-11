// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "layout.hpp"

#include "config.hpp"
#include "engine/layout/floating.hpp"
#include "engine/layout/master-stack.hpp"
#include "engine/layout/tabbed.hpp"

namespace Bismuth
{

std::unique_ptr<Layout> Layout::fromId(std::string_view id, const Bismuth::Config &config)
{
    if (id == "tabbed") {
        return std::make_unique<TabbedLayout>();
    } else if (id == "master-stack") {
        return std::make_unique<MasterStackLayout>(config);
    } else if (id == "floating") {
        return std::make_unique<FloatingLayout>();
    } else {
        return {};
    }
}

}
