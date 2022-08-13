// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QRectF>
#include <memory>
#include <optional>
#include <vector>

#include "layout/layout.hpp"
#include "plasma-api/window.hpp"

namespace PlasmaApi
{
struct Window;
}

namespace Bismuth
{
struct WindowGroup;

struct WindowGroup {
    WindowGroup() = delete;
    WindowGroup(const QRectF &geometry);
    WindowGroup(const PlasmaApi::Window &);

    bool isWindowNode();

    void addWindow(const PlasmaApi::Window &);

    /**
     * Remove window from the current group
     * @return whether the window was deleted
     */
    bool removeWindow(const PlasmaApi::Window &);

    void arrange();

    void setLayout(std::string_view id);

    std::vector<WindowGroup *> children();

    void setGeometry(const QRectF &);
    QRectF geometry() const;

private:
    std::unique_ptr<Layout> m_layout{Layout::fromId("tabbed")}; ///< Tiling logic of this window group
    std::vector<std::unique_ptr<WindowGroup>> m_children{}; ///< Windows or nodes of this group
    QRectF m_geometry{}; ///< Group working area, where it places its children
    std::optional<PlasmaApi::Window> m_window{}; ///< A window owned by the node, if it's a leaf
};

}
