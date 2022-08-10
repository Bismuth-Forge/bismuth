// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "window_group.hpp"
#include "logger.hpp"
#include "plasma-api/window.hpp"

namespace Bismuth
{
WindowGroup::WindowGroup(const PlasmaApi::Window &window)
    : m_window(window)
{
}

bool WindowGroup::isWindowNode()
{
    return m_children.empty();
}

void WindowGroup::addWindow(const PlasmaApi::Window &window)
{
    if (m_children.empty()) {
        qWarning(Bi) << "Attempt to add a window to an empty node";
        return;
    }

    auto &firstChild = m_children.front();

    // Depth-first addition
    if (firstChild->isWindowNode()) {
        // Add a neighbor
        m_children.push_back(std::make_unique<WindowGroup>(window));
    } else {
        // Add to the deepest subgroup
        firstChild->addWindow(window);
    }
}

void WindowGroup::removeWindow(const PlasmaApi::Window &)
{
}

std::vector<WindowGroup *> WindowGroup::children()
{
    auto result = std::vector<WindowGroup *>(m_children.size());
    for (size_t i = 0; i < m_children.size(); i++) {
        result[i] = m_children[i].get();
    }
    return result;
}

void WindowGroup::setGeometry(const QRectF &value)
{
    m_geometry = value;
}

QRectF WindowGroup::geometry() const
{
    return m_geometry;
}

}
