// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "window.hpp"

namespace Bismuth
{

Window::Window(PlasmaApi::Client client)
    : m_client(client)
{
}

bool Window::operator<(const Window &rhs) const
{
    return m_client < m_client;
}

void Window::setMode(Mode value)
{
    m_mode = value;
}

Window::Mode Window::mode() const
{
    return m_mode;
}

bool Window::visibleOn(const Surface &surface)
{
    // All minimized windows are invisible by definition
    if (m_client.minimized()) {
        return false;
    }

    // The window must be on the surface's desktop (or be on all desktops)
    if (!m_client.onAllDesktops() && m_client.desktop() != surface.desktop()) {
        return false;
    }

    // The window must be on the surface's screen
    if (m_client.screen() != surface.screen()) {
        return false;
    }

    // The window must be on the surface's activity or on all activities
    if (m_client.activities().size() != 0 && !m_client.activities().contains(surface.activity())) {
        return false;
    }

    return true;
}

}
