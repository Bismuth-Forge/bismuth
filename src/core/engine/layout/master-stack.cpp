// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "master-stack.hpp"

#include "engine/window-group.hpp"

namespace Bismuth
{

QString MasterStackLayout::id() const
{
    return QStringLiteral("master-stack");
}

QString MasterStackLayout::name() const
{
    return QStringLiteral("Master-Stack");
}

void MasterStackLayout::placeGroup(WindowGroup &group){
    // TODO
};

}
