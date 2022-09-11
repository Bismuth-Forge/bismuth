// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <cstdint>
#include <vector>

#include "layout.hpp"
#include "piece/rotatable.hpp"

class QRectF;

namespace Bismuth
{

struct WindowGroup;

struct MasterStackLayout : Layout {
    MasterStackLayout(const Bismuth::Config &config);

    virtual QString id() const override;
    virtual QString name() const override;

    virtual void placeGroup(WindowGroup &) override;

private:
    std::unique_ptr<LayoutPiece> m_basePiece;
};

}
