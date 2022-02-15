// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@genda.life>
// SPDX-License-Identifier: MIT

#include "toplevel.hpp"

namespace PlasmaApi
{

TopLevel::TopLevel(QObject *kwinImpl)
    : m_kwinImpl(kwinImpl){};

TopLevel::TopLevel(const TopLevel &rhs)
    : m_kwinImpl(rhs.m_kwinImpl){};
}
