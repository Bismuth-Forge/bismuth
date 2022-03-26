// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include "plasma-api/client.hpp"

namespace Bismuth
{
class Window
{
public:
    enum class Mode {
        Ignored,
        Floating,
        Fullscreen,
        Maximized,
        Tiled,
    };

    Window(PlasmaApi::Client client);

    bool operator<(const Window &rhs) const;

    void setMode(Mode);
    Mode mode() const;

private:
    PlasmaApi::Client m_client;

    Mode m_mode;
};
}
