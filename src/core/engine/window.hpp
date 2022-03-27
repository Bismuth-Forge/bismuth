// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include "engine/surface.hpp"
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

    QRect geometry() const;
    void setGeometry(QRect);

    void setMode(Mode);
    Mode mode() const;

    bool visibleOn(const Surface &surface);

private:
    PlasmaApi::Client m_client;

    Mode m_mode;
};
}
