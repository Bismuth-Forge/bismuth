// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

namespace Bismuth
{
struct WindowGroup;

struct Layout {
    virtual void placeGroup(const WindowGroup &) = 0;
};

}
