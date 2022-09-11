// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <cstdint>

#include "piece.hpp"

namespace Bismuth
{
struct AngleDependentPiece : LayoutPiece {
    AngleDependentPiece(const Bismuth::Config &);

protected:
    Qt::Orientation orientation();
    bool reversed();

    int16_t m_angle{};
};

}
