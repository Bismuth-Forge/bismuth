// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include "plasma-api/client.hpp"
#include "window.hpp"

namespace Bismuth
{
class WindowsList
{
public:
    void add(PlasmaApi::Client);
    void remove(PlasmaApi::Client);

private:
    std::map<PlasmaApi::Client, Window> m_windowMap{};
};
}
