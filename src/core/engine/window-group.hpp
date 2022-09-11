// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QRectF>
#include <memory>
#include <optional>
#include <vector>

#include "config.hpp"
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
    WindowGroup(const QRectF &geometry, const Bismuth::Config &config);
    WindowGroup(const PlasmaApi::Window &window, const Bismuth::Config &config);

    bool isWindowNode();

    void addWindow(const PlasmaApi::Window &);

    /**
     * Remove window from the current group
     * @return whether the window was deleted
     */
    bool removeWindow(const PlasmaApi::Window &);

    void arrange();

    void setLayout(std::string_view id);
    Layout *layout();

    std::vector<WindowGroup *> children();
    size_t size() const;

    qreal weight() const;

    void setGeometry(const QRectF &);
    QRectF geometry() const;

private:
    const Bismuth::Config &m_config;
    std::unique_ptr<Layout> m_layout{}; ///< Tiling logic of this window group
    std::vector<std::unique_ptr<WindowGroup>> m_children{}; ///< Windows or nodes of this group
    QRectF m_geometry{}; ///< Group working area, where it places its children
    std::optional<PlasmaApi::Window> m_window{}; ///< A window owned by the node, if it's a leaf

    /**
     * Group weight relative to other groups it may appear with.
     * Weight is used for distributing groups inside layouts.
     * Groups with bigger weight will get more space and vice versa.
     */
    qreal m_weight{1};
};

}
