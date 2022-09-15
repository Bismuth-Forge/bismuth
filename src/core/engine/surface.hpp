// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QString>
#include <optional>

#include "engine/window-group.hpp"
#include "plasma-api/virtual-desktop.hpp"

namespace PlasmaApi
{
struct Window;
class Api;
}

namespace Bismuth
{
class Config;

struct Surface {
    Surface(const PlasmaApi::VirtualDesktop &virtualDesktop, int screen, const QRectF &geometry, const Config &);
    bool operator==(const Surface &rhs);

    QString key();
    static QString key(const QString &virtualDesktopId, int screen);

    QString virtualDesktopId() const;
    int x11DesktopNumber() const;
    int screen() const;

    void addWindow(const PlasmaApi::Window &);
    void removeWindow(const PlasmaApi::Window &);

    void arrangeWindows();

    void setMainLayout(std::string_view id);
    Layout *mainLayout();

    void adjustWorkingArea(const QRectF &);
    QRectF workingArea() const;

private:
    PlasmaApi::VirtualDesktop m_virtualDesktop;
    int m_screen;

    std::optional<WindowGroup> m_windows;
    const Config &m_config;
};
}
