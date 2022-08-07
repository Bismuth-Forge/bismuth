// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "surface.hpp"
#include "plasma-api/api.hpp"

namespace Bismuth
{
Surface::Surface(const QString &virtualDesktopId, int screen)
    : m_virtualDesktopId(virtualDesktopId)
    , m_screen(screen)
    , m_windows()
{
}

QString Surface::virtualDesktopId() const
{
    return m_virtualDesktopId;
}

int Surface::screen() const
{
    return m_screen;
}

}
