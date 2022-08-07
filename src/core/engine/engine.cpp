// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "engine.hpp"

#include <QString>

#include "config.hpp"
#include "engine/surface.hpp"
#include "engine/window.hpp"
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
    auto windowSurfaces = std::vector<Surface>();
    auto windowVDs = newWindow.desktops();

    auto window = std::make_shared<Bismuth::Window>(newWindow, m_plasmaApi.workspace());

    for (auto &desktop : windowVDs) {
        auto [it, wasInserted] = m_surfaces.try_emplace(Surface::key(desktop.id(), newWindow.screen()), desktop.id(), newWindow.screen());

        it->second.addWindow(window);
    }
}
}
