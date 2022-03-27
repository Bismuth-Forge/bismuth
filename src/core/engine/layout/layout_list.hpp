// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <functional>
#include <map>
#include <memory>

#include "engine/surface.hpp"
#include "layout.hpp"

namespace Bismuth
{
struct LayoutList {
    const Layout &layoutOnSurface(const Surface &);

private:
    std::map<Surface, std::unique_ptr<Layout>> m_layouts{};
};
}
