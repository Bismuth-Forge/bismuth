// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "surface.hpp"

namespace Bismuth
{
Surface::Surface(int desktop, int screen, const QString &activity)
    : m_desktop(desktop)
    , m_screen(screen)
    , m_activity(activity)
{
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
