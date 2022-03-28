// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QRect>

#include <vector>

#include "config.hpp"
#include "engine/window.hpp"

namespace Bismuth
{
struct Layout {
    Layout(const Bismuth::Config &);

    /**
     * Apply layout for the @p windows on tiling @p area. Method changes the
     * geometry of the windows to match the particular layout.
     */
    virtual void apply(QRect area, std::vector<Window> &windows) const = 0;

    /**
     * Get the area on which tiled windows could be placed given the general @p workingArea
     */
    virtual QRect tilingArea(QRect workingArea) const;

protected:
    const Bismuth::Config &m_config;
};
}
