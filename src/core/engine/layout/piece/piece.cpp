// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "piece.hpp"
#include "config.hpp"

namespace Bismuth
{
LayoutPiece::LayoutPiece(const Bismuth::Config &config)
    : m_config(config)
{
}

const Bismuth::Config &LayoutPiece::config() const
{
    return m_config;
}
}
