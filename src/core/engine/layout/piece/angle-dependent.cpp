// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "angle-dependent.hpp"

namespace Bismuth
{
AngleDependentPiece::AngleDependentPiece(const Bismuth::Config &config)
    : LayoutPiece(config)
{
}

Qt::Orientation AngleDependentPiece::orientation()
{
    return m_angle == 0 || m_angle == 180 ? Qt::Horizontal : Qt::Vertical;
}

bool AngleDependentPiece::reversed()
{
    return m_angle == 180 || m_angle == 270;
}

}
