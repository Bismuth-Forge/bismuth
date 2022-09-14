// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "floating.hpp"

#include "engine/window-group.hpp"

namespace Bismuth
{
QString FloatingLayout::id() const
{
    return QStringLiteral("floating");
}

QString FloatingLayout::name() const
{
    return QStringLiteral("Floating");
}

void FloatingLayout::placeGroup(WindowGroup &group)
{
    Q_UNUSED(group)
    // Do nothing
};

}
