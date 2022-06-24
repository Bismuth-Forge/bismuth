// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <optional>

#include "engine/surface.hpp"
#include "plasma-api/window.hpp"
#include "plasma-api/workspace.hpp"
#include "window.hpp"

namespace Bismuth
{
struct WindowsList {
    WindowsList(PlasmaApi::Workspace &);

    Window &add(PlasmaApi::Window);
    void remove(PlasmaApi::Window);

    std::optional<Window> activeWindow() const;

    std::vector<Window> visibleWindowsOn(const Surface &surface) const;

private:
    std::map<PlasmaApi::Window, Window> m_windowMap{};

    PlasmaApi::Workspace &m_workspace;
};
}
