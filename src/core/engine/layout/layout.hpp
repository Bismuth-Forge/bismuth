// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <memory>
#include <string_view>

namespace Bismuth
{
struct WindowGroup;

struct Layout {
    virtual void placeGroup(WindowGroup &) = 0;

    static std::unique_ptr<Layout> fromId(std::string_view id);
};

}
