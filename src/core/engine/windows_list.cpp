// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "windows_list.hpp"
#include "logger.hpp"

namespace Bismuth
{

void WindowsList::add(PlasmaApi::Client)
{
    qDebug(Bi) << "Adding window... (CXX)";
}
}
