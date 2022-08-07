// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <memory>
#include <vector>

namespace Bismuth
{

class WindowGroup
{
    // std::unique_ptr<Layout> m_layout; // Tiling logic of this window group
    std::vector<std::unique_ptr<WindowGroup>> m_children; // Windows of this group
};

}
