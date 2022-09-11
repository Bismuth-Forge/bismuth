// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QRectF>

#include <unordered_map>
#include <vector>

namespace Bismuth
{
struct WindowGroup;
class Config;

struct LayoutPiece {
    LayoutPiece(const Bismuth::Config &);

    virtual std::unordered_map<WindowGroup *, QRectF> apply(const QRectF &area, const std::vector<WindowGroup *> &groups) = 0;

    const Bismuth::Config &config() const;

protected:
    const Bismuth::Config &m_config;
};
}
