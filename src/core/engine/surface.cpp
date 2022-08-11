// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "surface.hpp"

#include "logger.hpp"
#include "plasma-api/api.hpp"

namespace Bismuth
{
Surface::Surface(const QString &virtualDesktopId, int screen)
    : m_virtualDesktopId(virtualDesktopId)
    , m_screen(screen)
    , m_windows()
{
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
    if (!m_windows.has_value()) {
        m_windows.emplace(QRectF());
    }

    m_windows->addWindow(window);
}

void Surface::removeWindow(const PlasmaApi::Window &window)
{
    if (!m_windows.has_value()) {
        return;
    }

    m_windows->removeWindow(window);
}

}
