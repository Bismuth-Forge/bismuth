// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "client.mock.hpp"

FakeKWinClient &FakeKWinClient::operator=(const FakeKWinClient &rhs)
{
    if (&rhs != this) {
        m_minimized = rhs.m_minimized;
        m_onAllDesktops = rhs.m_onAllDesktops;
        m_desktop = rhs.m_desktop;
        m_screen = rhs.m_screen;
        m_activities = rhs.m_activities;
    }

    return *this;
}
