// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "workspace.mock.hpp"

namespace KWin
{
Workspace &Workspace::operator=(const Workspace &rhs)
{
    if (this != &rhs) { }

    return *this;
}

}
