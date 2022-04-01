// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "engine.hpp"

#include <algorithm>

#include "config.hpp"
#include "engine/surface.hpp"
#include "engine/window.hpp"
#include "logger.hpp"
#include "plasma-api/api.hpp"

namespace Bismuth
{
Engine::Engine(PlasmaApi::Api &api, const Bismuth::Config &config)
    : m_config(config)
    , m_windows(api.workspace())
    , m_activeLayouts(config)
    , m_plasmaApi(api)
{
}

void Engine::addWindow(PlasmaApi::Client client)
{
    // Don't manage special windows - docks, panels, etc.
    if (client.specialWindow() || client.dialog()) {
        return;
    }

    // If the window is initially set to be always on top, it means that it
    // definitely does not want to be tiled. This also might be a signal, that
    // the window is a launcher: KRunner, ULauncher, etc. This also keeps away
    // various application pop-ups
    if (client.keepAbove()) {
        return;
    }

    auto &newWindow = m_windows.add(client);

    auto surfaces = newWindow.surfaces();

    arrangeWindowsOnSurfaces(surfaces);

    qDebug(Bi) << "New Window appears on" << surfaces.size() << "surfaces!";

    // Bind events of this window
}

void Engine::removeWindow(PlasmaApi::Client client)
{
    m_windows.remove(client);
}

void Engine::focusWindowByOrder(FocusOrder focusOrder)
{
    auto windowsToChoseFrom = m_windows.visibleWindowsOn(activeSurface());

    if (windowsToChoseFrom.empty()) {
        return;
    }

    // If there is no current window, select the first one.
    auto activeWindow = m_windows.activeWindow();
    if (!activeWindow.has_value()) {
        activeWindow = windowsToChoseFrom.front();
    }

    auto windowIter = std::find(windowsToChoseFrom.begin(), windowsToChoseFrom.end(), activeWindow.value());

    // If there is no windows to chose - do nothing
    if (windowIter == windowsToChoseFrom.end()) {
        return;
    }

    // Select the next or the previous window circularly
    if (focusOrder == FocusOrder::Next) {
        windowIter++;
        if (windowIter == windowsToChoseFrom.end()) {
            windowIter = windowsToChoseFrom.begin();
        }
    } else if (focusOrder == FocusOrder::Previous) {
        windowIter--;
        if (windowIter < windowsToChoseFrom.begin()) {
            windowIter = --windowsToChoseFrom.end();
        }
    }
    windowIter->activate();
    qDebug() << "Activated window title:" << windowIter->caption();
}

void Engine::focusWindowByDirection(FocusDirection direction)
{
    auto windowsToChoseFrom = m_windows.visibleWindowsOn(activeSurface());

    if (windowsToChoseFrom.empty()) {
        return;
    }

    // If there is no current window, select the first one.
    auto activeWindow = m_windows.activeWindow();
    if (!activeWindow.has_value()) {
        activeWindow = windowsToChoseFrom.front();
    }

    auto window = windowNeighbor(direction, activeWindow.value());

    if (window.has_value()) {
        window->activate();
    }
}

void Engine::arrangeWindowsOnAllSurfaces()
{
    auto allSurfaces = [this]() -> std::vector<Surface> {
        auto currentActivity = m_plasmaApi.workspace().currentActivity();

        auto result = std::vector<Surface>();

        for (auto desktop = 1; desktop <= m_plasmaApi.workspace().desktops(); desktop++) {
            for (auto screen = 0; screen < m_plasmaApi.workspace().numScreens(); screen++) {
                result.push_back(Surface(desktop, screen, currentActivity));
            }
        }

        return result;
    };

    arrangeWindowsOnSurfaces(allSurfaces());
}

void Engine::arrangeWindowsOnVisibleSurfaces()
{
    auto screenSurfaces = [this]() -> std::vector<Surface> {
        auto currentDesktop = m_plasmaApi.workspace().currentDesktop();
        auto currentActivity = m_plasmaApi.workspace().currentActivity();
        auto result = std::vector<Surface>(1, Surface(currentDesktop, 0, currentActivity));

        // Add from additional screens
        for (auto screen = 1; screen < m_plasmaApi.workspace().numScreens(); screen++) {
            result.push_back(Surface(currentDesktop, screen, currentActivity));
        }

        return result;
    };

    arrangeWindowsOnSurfaces(screenSurfaces());
}

void Engine::arrangeWindowsOnSurfaces(const std::vector<Surface> &surfaces)
{
    for (auto &surface : surfaces) {
        arrangeWindowsOnSurface(surface);
    }
}

std::optional<Window> Engine::windowNeighbor(FocusDirection direction, const Window &basisWindow)
{
    /**
     * Tests if two ranges are overlapping
     * @param min1 Range 1, begin
     * @param max1 Range 1, end
     * @param min2 Range 2, begin
     * @param max2 Range 2, end
     */
    // auto overlap = [](int min1, int max1, int min2, int max2) {
    //     return std::max(0, std::min(max1, max2) - std::max(min1, min2)) > 0;
    // };
    //
    // auto getNeighborCandidates = [&](const Window &basis, FocusDirection direction) {
    //     auto surfaceWindows = m_windows.visibleWindowsOn(activeSurface());
    //
    //     // Flipping all inputs' signs allows for the same logic to find closest windows in either direction
    //     auto sign = direction == FocusDirection::Down || direction == FocusDirection::Right ? 1 : -1;
    //
    //     auto result = std::vector<Window>();
    //     if (direction == FocusDirection::Up || direction == FocusDirection::Down) {
    //         std::copy_if(surfaceWindows.cbegin(), surfaceWindows.cend(), result.begin(), [&](const Window &window) {
    //             return window.geometry().y() * sign > basis.geometry().y() * sign
    //                 && overlap(basis.geometry().x(), basis.geometry().right(), window.geometry().x(), window.geometry().right());
    //         });
    //     } else {
    //         std::copy_if(surfaceWindows.cbegin(), surfaceWindows.cend(), result.begin(), [&](const Window window) {
    //             return window.geometry().x() * sign > basis.geometry().x() * sign
    //                 && overlap(basis.geometry().y(), basis.geometry().bottom(), window.geometry().y(), window.geometry().bottom());
    //         });
    //     }
    //
    //     return result;
    // };
    //
    // auto neighborCandidates = getNeighborCandidates(basisWindow, direction);
    //
    // if (neighborCandidates.empty()) {
    //     return {};
    // }
    //
    // auto getClosestRelativWindowCorner = [&]() {
    //     return std::reduce(neighborCandidates.cbegin(), neighborCandidates.cend(), [&](int prevValue, const Window &window) {
    //         if (direction == FocusDirection::Up) {
    //             return std::max(window.geometry().bottom(), prevValue);
    //         } else if (direction == FocusDirection::Down) {
    //             return std::min(window.geometry().y(), prevValue);
    //         } else if (direction == FocusDirection::Left) {
    //             return std::max(window.geometry().right(), prevValue);
    //         } else {
    //             return std::min(window.geometry().x(), prevValue);
    //         }
    //     });
    // };
    // auto closestWindowCorner = getClosestRelativWindowCorner(neighborCandidates, dir);

    // auto closestWindows = this.getClosestRelativeWindow(neighborCandidates, dir, closestWindowCorner);

    // return closestWindows.front();

    // TODO Implement
    return {};
}

Surface Engine::activeSurface() const
{
    auto activeScreen = m_plasmaApi.workspace().activeScreen();
    auto currentDesktop = m_plasmaApi.workspace().currentDesktop();
    auto currentActivity = m_plasmaApi.workspace().currentActivity();

    return Surface(currentDesktop, activeScreen, currentActivity);
}

void Engine::arrangeWindowsOnSurface(const Surface &surface)
{
    auto &layout = m_activeLayouts.layoutOnSurface(surface);
    auto tilingArea = layout.tilingArea(workingArea(surface));

    auto visibleWindows = m_windows.visibleWindowsOn(surface);
    auto windowsThatCanBeTiled = visibleWindows; // TODO: Filter windows

    layout.apply(tilingArea, windowsThatCanBeTiled);
}

QRect Engine::workingArea(const Surface &surface) const
{
    return m_plasmaApi.workspace().clientArea(PlasmaApi::Workspace::PlacementArea, surface.screen(), surface.desktop());
}
}
