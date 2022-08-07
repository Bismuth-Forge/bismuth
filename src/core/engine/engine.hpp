// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <unordered_set>

#include "config.hpp"
#include "engine/surface.hpp"

#include "plasma-api/api.hpp"
#include "plasma-api/window.hpp"

namespace Bismuth
{
struct Engine {
    Engine(PlasmaApi::Api &, const Bismuth::Config &);

    void addWindow(const PlasmaApi::Window &);

private:
    const Bismuth::Config &m_config;
    std::unordered_set<Bismuth::Surface> m_surfaces;
    PlasmaApi::Api &m_plasmaApi;
};
}
