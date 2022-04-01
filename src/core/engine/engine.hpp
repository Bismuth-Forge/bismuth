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
struct Engine {
    enum class FocusOrder { Next, Previous };
    enum class FocusDirection { Up, Down, Right, Left };

    Engine(PlasmaApi::Api &, const Bismuth::Config &);

    void addWindow(PlasmaApi::Client);
    void removeWindow(PlasmaApi::Client);

    void focusWindowByOrder(FocusOrder);
    void focusWindowByDirection(FocusDirection);

    void arrangeWindowsOnAllSurfaces();

    /**
     * Arrange the windows on all visible surfaces
     */
    void arrangeWindowsOnVisibleSurfaces();

    void arrangeWindowsOnSurfaces(const std::vector<Surface> &);

private:
    std::optional<Window> windowNeighbor(FocusDirection, const Window &);
    Surface activeSurface() const;

    void arrangeWindowsOnSurface(const Surface &);
    QRect workingArea(const Surface &surface) const;

    const Bismuth::Config &m_config;
    WindowsList m_windows;
    LayoutList m_activeLayouts;
    PlasmaApi::Api &m_plasmaApi;
};
}
