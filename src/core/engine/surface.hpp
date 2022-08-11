// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QString>
#include <optional>

#include "engine/window_group.hpp"

namespace PlasmaApi
{
struct Window;
class Api;
}

namespace Bismuth
{
struct Surface {
    Surface(const PlasmaApi::VirtualDesktop &virtualDesktop, int screen);
    bool operator==(const Surface &rhs);

    QString key();
    static QString key(const QString &virtualDesktopId, int screen);

    QString virtualDesktopId() const;
    int screen() const;

    void addWindow(const PlasmaApi::Window &);
    void removeWindow(const PlasmaApi::Window &);

    void arrangeWindows();

private:
    QString m_virtualDesktopId;
    int m_screen;

    std::optional<WindowGroup> m_windows;
};
}
