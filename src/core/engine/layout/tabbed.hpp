// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include "engine/layout.hpp"

namespace Bismuth
{

struct WindowGroup;

struct TabbedLayout : Layout {
    virtual void placeGroup(const WindowGroup &) override;
};

}
