// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include "engine/layout/layout_list.hpp"
#include "engine/surface.hpp"
#include "plasma-api/api.hpp"
#include "plasma-api/client.hpp"
#include "windows_list.hpp"

namespace Bismuth
{
class Engine
{
public:
    Engine(PlasmaApi::Api &, const Bismuth::Config &);

    void addWindow(PlasmaApi::Client);
    void removeWindow(PlasmaApi::Client);

    /**
     * Arrange the windows on all visible surfaces
     */
    void arrangeWindowsOnVisibleSurfaces();

    void arrangeWindowsOnSurfaces(const std::vector<Surface> &);

private:
    void arrangeWindowsOnSurface(const Surface &);
    QRect workingArea(const Surface &surface) const;

    const Bismuth::Config &m_config;
    WindowsList m_windows{};
    LayoutList m_activeLayouts;
    PlasmaApi::Api &m_plasmaApi;
};
}
