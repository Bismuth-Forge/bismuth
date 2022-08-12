// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "window-group.hpp"
#include "engine/layout/tabbed.hpp"
#include "logger.hpp"
#include "plasma-api/window.hpp"

namespace Bismuth
{
WindowGroup::WindowGroup(const QRectF &geometry)
    : m_geometry(geometry)
{
}
WindowGroup::WindowGroup(const PlasmaApi::Window &window)
    : m_window(window)
    , m_geometry(window.frameGeometry())
{
}

bool WindowGroup::isWindowNode()
{
    return m_window.has_value();
}

void WindowGroup::addWindow(const PlasmaApi::Window &window)
{
    if (isWindowNode()) {
        qWarning(Bi) << "Attempt to add a window to the window node";
        return;
    }

    if (m_children.empty() || m_children.front()->isWindowNode()) {
        m_children.push_back(std::make_unique<WindowGroup>(window));
        return;
    } else {
        // Add to the deepest subgroup
        m_children.front()->addWindow(window);
    }
}

bool WindowGroup::removeWindow(const PlasmaApi::Window &windowToRemove)
{
    if (isWindowNode()) {
        qWarning(Bi) << "Attempt to remove a window from inside the window node";
        return false;
    }

    for (auto it = m_children.begin(); it != m_children.end(); it++) {
        auto &child = *it;
        if (child->isWindowNode() && child->m_window == windowToRemove) {
            m_children.erase(it);
            return true;
        } else if (child->removeWindow(windowToRemove)) {
            return true;
        }
    }

    return false;
}

void WindowGroup::arrange()
{
    if (m_layout != nullptr) {
        m_layout->placeGroup(*this);
        qDebug(Bi) << "Arranging window group to geometry" << m_geometry;
    }
}

std::vector<WindowGroup *> WindowGroup::children()
{
    auto result = std::vector<WindowGroup *>(m_children.size());
    for (size_t i = 0; i < m_children.size(); i++) {
        result[i] = m_children[i].get();
    }
    return result;
}

void WindowGroup::setLayout(std::string_view id)
{
    qDebug(Bi) << "Setting surface layout to" << id.data();
    m_layout = Layout::fromId(id);
}

void WindowGroup::setGeometry(const QRectF &value)
{
    m_geometry = value;

    if (isWindowNode()) {
        qDebug(Bi) << "Setting" << m_window->caption() << "geometry to" << value.toRect();
        m_window->setFrameGeometry(value.toRect());
    }
}

QRectF WindowGroup::geometry() const
{
    return m_geometry;
}

}
