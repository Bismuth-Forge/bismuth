// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "engine.hpp"
#include "engine/surface.hpp"
#include "plasma-api/api.hpp"

namespace Bismuth
{
Engine::Engine(PlasmaApi::Api &api)
    : m_plasmaApi(api)
{
}

void Engine::addWindow(PlasmaApi::Client client)
{
    m_windows.add(client);
    // Bind events of this window
}

void Engine::removeWindow(PlasmaApi::Client client)
{
    m_windows.remove(client);
}

void Engine::arrange()
{
    // auto screenSurfaces = [this]() -> std::vector<Surface> {
    //     auto currentDesktop = m_plasmaApi.workspace().currentDesktop();
    //     auto currentActivity = m_plasmaApi.workspace().currentActivity();
    //     auto result = std::vector<Surface>(1, Surface(currentDesktop, 0, currentActivity));
    //
    //     // Add from additional screens
    //     for (auto screen = 1; screen < m_plasmaApi.workspace().numScreens(); screen++) {
    //         result.push_back(Surface(currentDesktop, screen, currentActivity));
    //     }
    //
    //     return result;
    // };
    //
    // for (auto &surface : screenSurfaces()) {
    //     arrangeWindowsOnSurface(surface);
    // }
}

void Engine::arrangeWindowsOnSurface(const Surface &surface)
{
    // auto &layout = m_activeLayouts.layoutOnSurface(surface);
    auto workingArea = QRect();
    auto tilingArea = QRect();

    auto visibleWindows = m_windows.visibleWindowsOn(surface);

    // auto windowsThatCanBeTiled = std::vector<Window>();

    // Maximize sole tile if enabled or apply the current layout as expected
    // ...
    // Or
    // Apply layout to windows

    // If enabled, limit the windows' width

    // Commit window assigned properties
    // visibleWindows.forEach((win : EngineWindow) = > win.commit());
}

}
