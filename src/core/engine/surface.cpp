// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "surface.hpp"
#include "plasma-api/api.hpp"

namespace Bismuth
{
Surface::Surface(int desktop, int screen, const QString &activity)
    : m_desktop(desktop)
    , m_screen(screen)
    , m_activity(activity)
{
}

bool Surface::operator<(const Surface &rhs) const
{
    if (m_screen < rhs.m_screen) {
        return true;
    } else if (m_screen > rhs.m_screen) {
        return false;
    }

    if (m_desktop < rhs.m_desktop) {
        return true;
    } else if (m_desktop > rhs.m_desktop) {
        return false;
    }

    // Same screen, same desktop, different activities
    return m_activity < rhs.m_activity;
}

int Surface::desktop() const
{
    return m_desktop;
}

int Surface::screen() const
{
    return m_screen;
}

QString Surface::activity() const
{
    return m_activity;
}

}
