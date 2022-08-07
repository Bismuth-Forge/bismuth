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
    , m_surfaces()
    , m_plasmaApi(api)
{
}

void Engine::addWindow(const PlasmaApi::Window &newWindow)
{
}
}
