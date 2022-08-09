// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <unordered_map>

#include "config.hpp"
#include "engine/surface.hpp"

namespace PlasmaApi
{
struct Window;
struct Api;
}

namespace Bismuth
{
struct Engine {
    Engine(PlasmaApi::Api &, const Bismuth::Config &);

    void addWindow(const PlasmaApi::Window &);
    void removeWindow(const PlasmaApi::Window &);

private:
    const Bismuth::Config &m_config;
    std::unordered_map<QString, Bismuth::Surface> m_surfaces;
    PlasmaApi::Api &m_plasmaApi;
};
}
