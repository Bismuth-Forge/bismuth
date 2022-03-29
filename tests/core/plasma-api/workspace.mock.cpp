// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "workspace.mock.hpp"

FakeKWinWorkspace &FakeKWinWorkspace::operator=(const FakeKWinWorkspace &rhs)
{
    if (this != &rhs) { }

    return *this;
}
