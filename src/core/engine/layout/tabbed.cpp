// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "tabbed.hpp"

#include "engine/window-group.hpp"

namespace Bismuth
{
QString TabbedLayout::id() const
{
    return QStringLiteral("tabbed");
}

QString TabbedLayout::name() const
{
    return QStringLiteral("Tabbed");
}

void TabbedLayout::placeGroup(WindowGroup &group)
{
    auto restArea = placeTabline(group.geometry());

    for (auto &child : group.children()) {
        child->setGeometry(restArea);
    }
};

QRectF TabbedLayout::placeTabline(const QRectF &geometry)
{
    // TODO: Implement placing tab line using QML components
    // For now we just reserving the space for the line
    auto tabBarHeight = 0;
    return geometry.adjusted(0, tabBarHeight, 0, 0);
}

}
