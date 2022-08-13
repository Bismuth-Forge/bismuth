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
class Controller;
class View;

struct Engine {
    Engine(PlasmaApi::Api &, View &, const Bismuth::Config &);

    void addWindow(const PlasmaApi::Window &);
    void removeWindow(const PlasmaApi::Window &);

    void setLayoutOnActiveSurface(std::string_view id);

    void arrangeWindowsOnAllSurfaces();

    void showOSD(const QString &text, const QString &icon = {}, const QString &hint = {});

private:
    std::optional<Surface *> activeSurface();

    const Bismuth::Config &m_config;
    PlasmaApi::Api &m_plasmaApi;
    Bismuth::View &m_view;

    std::unordered_map<QString, Bismuth::Surface> m_surfaces{};
};
}
