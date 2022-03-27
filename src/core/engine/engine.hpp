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
    Engine(PlasmaApi::Api &);

    void addWindow(PlasmaApi::Client);
    void removeWindow(PlasmaApi::Client);

    /**
     * Arrange the windows on all visible surfaces
     */
    void arrange();

private:
    void arrangeWindowsOnSurface(const Surface &);

    WindowsList m_windows{};
    LayoutList m_activeLayouts{};
    PlasmaApi::Api &m_plasmaApi;
};
}
