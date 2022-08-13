// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "engine.hpp"

#include <QQmlContext>
#include <QString>

#include "config.hpp"
#include "engine/surface.hpp"
#include "logger.hpp"
#include "plasma-api/api.hpp"
#include "plasma-api/virtual-desktop.hpp"
#include "plasma-api/window.hpp"
#include "view.hpp"

namespace Bismuth
{
Engine::Engine(PlasmaApi::Api &api, Bismuth::View &view, const Bismuth::Config &config)
    : m_config(config)
    , m_plasmaApi(api)
    , m_view(view)
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

    auto windowSurfaces = std::vector<Surface>();
    auto windowVDs = newWindow.desktops();

    for (auto &desktop : windowVDs) {
        // TODO: Use signature with pointers to screen and virtual desktop
        auto surfaceGeometry = m_plasmaApi.workspace().clientArea(PlasmaApi::Workspace::PlacementArea, newWindow.screen(), desktop.x11DesktopNumber());
        auto [it, wasInserted] = m_surfaces.try_emplace(Surface::key(desktop.id(), newWindow.screen()), desktop, newWindow.screen(), surfaceGeometry, m_config);

        qDebug(Bi) << "Adding new window" << newWindow.caption() << "to virtual desktop" << desktop.name() << "and screen" << newWindow.screen();
        it->second.addWindow(newWindow);
        it->second.arrangeWindows();
    }
}

void Engine::removeWindow(const PlasmaApi::Window &windowToRemove)
{
    qDebug(Bi) << "Removing window" << windowToRemove.caption();

    auto windowSurfaces = std::vector<Surface>();
    auto windowVDs = windowToRemove.desktops();

    for (auto &desktop : windowVDs) {
        auto surfaceKey = Surface::key(desktop.id(), windowToRemove.screen());

        auto it = m_surfaces.find(surfaceKey);
        if (it == m_surfaces.end()) {
            continue;
        }

        it->second.removeWindow(windowToRemove);
        it->second.arrangeWindows();
    }
}

void Engine::setLayoutOnActiveSurface(std::string_view id)
{
    auto activeSurfaceOpt = activeSurface();

    if (!activeSurfaceOpt.has_value()) {
        return;
    }

    auto activeSurf = activeSurfaceOpt.value();

    activeSurf->setMainLayout(id);

    auto layout = activeSurf->mainLayout();

    if (layout == nullptr) {
        return;
    }

    showOSDForLayout(*layout);
}

void Engine::arrangeWindowsOnAllSurfaces()
{
    for (auto &[id, surface] : m_surfaces) {
        qDebug(Bi) << "Arranging Windows on surface" << id;
        surface.arrangeWindows();
    }
}

void Engine::showOSDForLayout(const Layout &layout)
{
    m_view.showOSD(QStringLiteral("%1 Layout").arg(layout.name()), QStringLiteral("bismuth-%1").arg(layout.id()));
}

std::optional<Surface *> Engine::activeSurface()
{
    auto key = Surface::key(m_plasmaApi.workspace().currentVirtualDesktop().id(), m_plasmaApi.workspace().activeScreen());
    auto it = m_surfaces.find(key);

    if (it == m_surfaces.end()) {
        return {};
    }

    return &it->second;
}

}
