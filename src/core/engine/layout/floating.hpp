// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include "engine/layout.hpp"

class QRectF;

namespace Bismuth
{

struct WindowGroup;

struct FloatingLayout : Layout {
    virtual void placeGroup(WindowGroup &) override;
};

}
