// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "windows_list.hpp"
#include "engine/surface.hpp"
#include "logger.hpp"
#include "plasma-api/workspace.hpp"

namespace Bismuth
{

WindowsList::WindowsList(PlasmaApi::Workspace &workspace)
    : m_workspace(workspace)
{
}

Window &WindowsList::add(PlasmaApi::Client client)
{
    auto [it, _] = m_windowMap.insert_or_assign(client, Window(client, m_workspace));
    return it->second;
}

void WindowsList::remove(PlasmaApi::Client client)
{
    m_windowMap.erase(client);
}

std::vector<Window> WindowsList::visibleWindowsOn(const Surface &surface) const
{
    auto result = std::vector<Window>();
    for (auto [_, window] : m_windowMap) {
        if (window.visibleOn(surface)) {
            result.push_back(window);
        }
    }
    return result;
}

}
