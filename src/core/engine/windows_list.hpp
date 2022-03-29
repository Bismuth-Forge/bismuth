// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <optional>

#include "engine/surface.hpp"
#include "plasma-api/client.hpp"
#include "plasma-api/workspace.hpp"
#include "window.hpp"

namespace Bismuth
{
struct WindowsList {
    WindowsList(PlasmaApi::Workspace &);

    Window &add(PlasmaApi::Client);
    void remove(PlasmaApi::Client);

    std::optional<Window> activeWindow() const;

    std::vector<Window> visibleWindowsOn(const Surface &surface) const;

private:
    std::map<PlasmaApi::Client, Window> m_windowMap{};

    PlasmaApi::Workspace &m_workspace;
};
}
