// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <memory>
#include <vector>

#include "layout.hpp"

namespace PlasmaApi
{
struct Window;
}

namespace Bismuth
{
struct Window;
struct WindowGroup;

struct WindowGroup {
    void addWindow(const std::shared_ptr<Bismuth::Window> &);
    void removeWindow(const PlasmaApi::Window &);

private:
    std::unique_ptr<Layout> m_layout; // Tiling logic of this window group
    std::vector<std::unique_ptr<WindowGroup>> m_children; // Windows of this group
};

}
