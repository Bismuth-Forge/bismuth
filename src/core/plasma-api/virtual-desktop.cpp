// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "virtual-desktop.hpp"

namespace PlasmaApi
{

VirtualDesktop::VirtualDesktop(QObject *kwinImpl)
    : m_kwinImpl(kwinImpl){};

VirtualDesktop::VirtualDesktop(const VirtualDesktop &rhs)
    : m_kwinImpl(rhs.m_kwinImpl){};

VirtualDesktop::VirtualDesktop(VirtualDesktop &&rhs)
    : m_kwinImpl(std::move(rhs.m_kwinImpl)){};

VirtualDesktop &VirtualDesktop::operator=(const VirtualDesktop &rhs)
{
    if (&rhs != this) {
        m_kwinImpl = rhs.m_kwinImpl;
    }

    return *this;
}

VirtualDesktop &VirtualDesktop::operator=(VirtualDesktop &&rhs)
{
    if (&rhs != this) {
        m_kwinImpl = std::move(rhs.m_kwinImpl);
    }

    return *this;
}

bool VirtualDesktop::operator==(const VirtualDesktop &rhs) const
{
    return m_kwinImpl == rhs.m_kwinImpl;
}

bool VirtualDesktop::operator<(const VirtualDesktop &rhs) const
{
    return m_kwinImpl < rhs.m_kwinImpl;
}

}
