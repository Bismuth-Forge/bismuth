// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <memory>
#include <string_view>

#include <QString>

namespace Bismuth
{
struct WindowGroup;

struct Layout {
    virtual QString id() const = 0;
    virtual QString name() const = 0;
    virtual void placeGroup(WindowGroup &) = 0;

    static std::unique_ptr<Layout> fromId(std::string_view id);
};

}
