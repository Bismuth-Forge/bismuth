// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include "engine/layout.hpp"

class QRectF;

namespace Bismuth
{

struct WindowGroup;

struct TabbedLayout : Layout {
    virtual void placeGroup(WindowGroup &) override;

private:
    QRectF placeTabline(const QRectF &geometry);
};

}
