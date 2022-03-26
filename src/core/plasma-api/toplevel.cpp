// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "toplevel.hpp"

namespace PlasmaApi
{

TopLevel::TopLevel(QObject *kwinImpl)
    : m_kwinImpl(kwinImpl){};

TopLevel::TopLevel(const TopLevel &rhs)
    : m_kwinImpl(rhs.m_kwinImpl){};

TopLevel::TopLevel(TopLevel &&rhs)
    : m_kwinImpl(rhs.m_kwinImpl){};

TopLevel &TopLevel::operator=(const TopLevel &rhs)
{
    if (&rhs != this) {
        m_kwinImpl = rhs.m_kwinImpl;
    }

    return *this;
}

TopLevel &TopLevel::operator=(TopLevel &&rhs)
{
    if (&rhs != this) {
        m_kwinImpl = std::move(rhs.m_kwinImpl);
    }

    return *this;
}
}
