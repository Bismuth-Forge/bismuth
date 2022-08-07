// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QString>
#include <optional>

#include "engine/window_group.hpp"

namespace Bismuth
{
struct Surface {
    Surface(const QString &virtualDesktopId, int screen);

    QString virtualDesktopId() const;
    int screen() const;

private:
    QString m_virtualDesktopId;
    int m_screen;

    std::optional<WindowGroup> m_windows;
};
}

// Taken from boost, I don't know how it works
template<class T>
inline void hash_combine(std::size_t &seed, const T &v)
{
    std::hash<T> hasher;
    seed ^= hasher(v) + 0x9e3779b9 + (seed << 6) + (seed >> 2);
}

template<>
struct std::hash<Bismuth::Surface> {
    std::size_t operator()(const Bismuth::Surface &s)
    {
        std::size_t seed = 0;
        hash_combine(seed, s.virtualDesktopId().toUtf8().constData());
        hash_combine(seed, s.screen());
        return seed;
    }
};
