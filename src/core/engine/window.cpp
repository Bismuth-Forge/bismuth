// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "window.hpp"

namespace Bismuth
{

Window::Window(PlasmaApi::Client client)
    : m_client(client)
{
}

bool Window::operator<(const Window &rhs) const
{
    return m_client < m_client;
}

void Window::setMode(Mode value)
{
    m_mode = value;
}

Window::Mode Window::mode() const
{
    return m_mode;
}

}
