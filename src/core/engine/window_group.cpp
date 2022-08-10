// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "window_group.hpp"

namespace Bismuth
{

void WindowGroup::addWindow(const std::shared_ptr<Bismuth::Window> &window)
{
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
