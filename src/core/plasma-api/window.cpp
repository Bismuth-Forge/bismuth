// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "window.hpp"

namespace PlasmaApi
{

Window::Window(QObject *kwinImpl)
    : m_kwinImpl(kwinImpl){};

Window::Window(const Window &rhs)
    : m_kwinImpl(rhs.m_kwinImpl){};

Window::Window(Window &&rhs)
    : m_kwinImpl(std::move(rhs.m_kwinImpl)){};

Window &Window::operator=(const Window &rhs)
{
    if (&rhs != this) {
        m_kwinImpl = rhs.m_kwinImpl;
    }

    return *this;
}

Window &Window::operator=(Window &&rhs)
{
    if (&rhs != this) {
        m_kwinImpl = std::move(rhs.m_kwinImpl);
    }

    return *this;
}

bool Window::operator==(const Window &rhs) const
{
    return m_kwinImpl == rhs.m_kwinImpl;
}

bool Window::operator<(const Window &rhs) const
{
    return m_kwinImpl < rhs.m_kwinImpl;
}

}
