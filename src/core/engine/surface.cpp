// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "surface.hpp"

#include "logger.hpp"
#include "plasma-api/api.hpp"
#include "plasma-api/virtual_desktop.hpp"

#include "config.hpp"

namespace Bismuth
{
Surface::Surface(const PlasmaApi::VirtualDesktop &virtualDesktop, int screen, const QRectF &geometry, const Config &config)
    : m_virtualDesktopId(virtualDesktop.id())
    , m_screen(screen)
    , m_windows(geometry)
{
    auto leftGap = config.screenGapLeft();
    auto topGap = config.screenGapTop();
    auto rightGap = config.screenGapRight();
    auto bottomGap = config.screenGapBottom();
    m_windows->setGeometry(geometry.adjusted(leftGap, topGap, -rightGap, -bottomGap));
}

bool Surface::operator==(const Surface &rhs)
{
    return m_virtualDesktopId == rhs.m_virtualDesktopId && m_screen == rhs.m_screen;
}

QString Surface::key()
{
    return key(m_virtualDesktopId, m_screen);
}

QString Surface::key(const QString &virtualDesktopId, int screen)
{
    return QStringLiteral("%1_%2").arg(virtualDesktopId).arg(screen);
}

QString Surface::virtualDesktopId() const
{
    return m_virtualDesktopId;
}

int Surface::screen() const
{
    return m_screen;
}

void Surface::addWindow(const PlasmaApi::Window &window)
{
    if (m_windows.has_value()) {
        m_windows->addWindow(window);
    }
}

void Surface::removeWindow(const PlasmaApi::Window &window)
{
    if (!m_windows.has_value()) {
        return;
    }

    m_windows->removeWindow(window);
}

void Surface::arrangeWindows()
{
    if (m_windows.has_value()) {
        m_windows->arrange();
    }
}

}
