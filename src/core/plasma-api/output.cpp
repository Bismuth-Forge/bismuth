// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "output.hpp"

namespace PlasmaApi
{

Output::Output(QObject *kwinImpl)
    : m_kwinImpl(kwinImpl){};

Output::Output(const Output &rhs)
    : m_kwinImpl(rhs.m_kwinImpl){};

Output::Output(Output &&rhs)
    : m_kwinImpl(std::move(rhs.m_kwinImpl)){};

Output &Output::operator=(const Output &rhs)
{
    if (&rhs != this) {
        m_kwinImpl = rhs.m_kwinImpl;
    }

    return *this;
}

Output &Output::operator=(Output &&rhs)
{
    if (&rhs != this) {
        m_kwinImpl = std::move(rhs.m_kwinImpl);
    }

    return *this;
}

bool Output::operator==(const Output &rhs) const
{
    return m_kwinImpl == rhs.m_kwinImpl;
}

bool Output::operator<(const Output &rhs) const
{
    return m_kwinImpl < rhs.m_kwinImpl;
}

}
