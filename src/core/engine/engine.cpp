// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "engine.hpp"

#include <QString>

#include "config.hpp"
#include "engine/surface.hpp"
#include "logger.hpp"
#include "plasma-api/api.hpp"
#include "plasma-api/virtual_desktop.hpp"

namespace Bismuth
{
Engine::Engine(PlasmaApi::Api &api, const Bismuth::Config &config)
    : m_config(config)
    , m_surfaces()
    , m_plasmaApi(api)
{
}

void Engine::addWindow(const PlasmaApi::Window &newWindow)
{
    // Don't manage special windows - docks, panels, etc.
    if (newWindow.specialWindow() || newWindow.dialog()) {
        return;
    }

    // If the window is initially set to be always on top, it means that it
    // definitely does not want to be tiled. This also might be a signal, that
    // the window is a launcher: KRunner, ULauncher, etc. This also keeps away
    // various application pop-ups
    if (newWindow.keepAbove()) {
        return;
    }

    qDebug(Bi) << "Adding new window" << newWindow.caption();

    auto windowSurfaces = std::vector<Surface>();
    auto windowVDs = newWindow.desktops();

    for (auto &desktop : windowVDs) {
        auto [it, wasInserted] = m_surfaces.try_emplace(Surface::key(desktop.id(), newWindow.screen()), desktop.id(), newWindow.screen());

        it->second.addWindow(newWindow);
    }
}

void Engine::removeWindow(const PlasmaApi::Window &windowToRemove)
{
    qDebug(Bi) << "Removing window" << windowToRemove.caption();

    auto windowSurfaces = std::vector<Surface>();
    auto windowVDs = windowToRemove.desktops();

    for (auto &desktop : windowVDs) {
        auto surfaceKey = Surface::key(desktop.id(), windowToRemove.screen());

        auto [it, wasInserted] = m_surfaces.try_emplace(surfaceKey, desktop.id(), windowToRemove.screen());

        it->second.removeWindow(windowToRemove);
    }
}

}
