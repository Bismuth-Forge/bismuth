// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include "layout.hpp"

class QRectF;

namespace Bismuth
{

struct WindowGroup;

struct FloatingLayout : Layout {
    virtual QString id() const override;
    virtual QString name() const override;

    virtual void placeGroup(WindowGroup &) override;
};

}
