// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "window.hpp"

#include "engine/surface.hpp"
#include "logger.hpp"
#include "plasma-api/workspace.hpp"

namespace Bismuth
{

Window::Window(PlasmaApi::Client client, PlasmaApi::Workspace &workspace)
    : m_client(client)
    , m_workspace(workspace)
{
}

bool Window::operator<(const Window &rhs) const
{
    return m_client < m_client;
}

bool Window::operator==(const Window &rhs) const
{
    return m_client == rhs.m_client;
}

void Window::activate()
{
    m_workspace.get().setActiveClient(m_client);
}

QRect Window::geometry() const
{
    return m_client.frameGeometry();
}

void Window::setGeometry(QRect newGeometry)
{
    m_client.setFrameGeometry(newGeometry);
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

std::vector<Surface> Window::surfaces() const
{
    auto desktopsList = desktops();
    auto screen = m_client.screen();

    auto activitiesList = activities();

    auto result = std::vector<Surface>();
    result.reserve(1);

    for (auto desktop : desktopsList) {
        for (auto activity : activitiesList) {
            result.push_back(Surface(desktop, screen, activity));
        }
    }

    return result;
}

std::vector<int> Window::desktops() const
{
    auto result = std::vector<int>();
    result.reserve(1);

    if (m_client.onAllDesktops()) {
        for (auto desktop = 1; desktop <= m_workspace.get().desktops(); desktop++) {
            result.push_back(desktop);
        }
    } else {
        result.push_back(m_client.desktop());
    }

    return result;
}

std::vector<QString> Window::activities() const
{
    auto result = std::vector<QString>();
    result.reserve(1);

    auto activitiesList = m_client.activities().empty() ? m_workspace.get().activities() : m_client.activities();

    for (auto activity : activitiesList) {
        result.push_back(activity);
    }

    return result;
}

QString Window::caption() const
{
    return m_client.caption();
}

}
