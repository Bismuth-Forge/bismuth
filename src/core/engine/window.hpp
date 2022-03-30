// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <functional>
#include <vector>

#include "engine/surface.hpp"
#include "plasma-api/client.hpp"
#include "plasma-api/workspace.hpp"

namespace Bismuth
{
struct Window {
    enum class Mode {
        Ignored,
        Floating,
        Fullscreen,
        Maximized,
        Tiled,
    };

    Window(PlasmaApi::Client, PlasmaApi::Workspace &);

    bool operator==(const Window &) const;
    bool operator<(const Window &rhs) const;

    void activate();

    QRect geometry() const;
    void setGeometry(QRect);

    void setMode(Mode);
    Mode mode() const;

    bool visibleOn(const Surface &surface);
    std::vector<Surface> surfaces() const;
    std::vector<int> desktops() const;
    std::vector<QString> activities() const;

    QString caption() const;

private:
    PlasmaApi::Client m_client;
    std::reference_wrapper<PlasmaApi::Workspace> m_workspace;

    Mode m_mode;
};
}
