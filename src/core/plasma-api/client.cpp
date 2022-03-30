// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "client.hpp"
#include "toplevel.hpp"

namespace PlasmaApi
{

Client::Client(QObject *kwinImpl)
    : TopLevel(kwinImpl){};

Client::Client(const Client &rhs)
    : TopLevel(rhs){};

bool Client::operator==(const Client &rhs) const
{
    return m_kwinImpl == rhs.m_kwinImpl;
}

bool Client::operator<(const Client &rhs) const
{
    return m_kwinImpl < rhs.m_kwinImpl;
}

}
