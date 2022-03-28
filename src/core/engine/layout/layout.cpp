// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "layout.hpp"

namespace Bismuth
{
Layout::Layout(const Bismuth::Config &config)
    : m_config(config)
{
}

QRect Layout::tilingArea(QRect workingArea) const
{
    return workingArea;
}
}
