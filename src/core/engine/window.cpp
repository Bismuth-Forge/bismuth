// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "window.hpp"

#include "engine/surface.hpp"
#include "logger.hpp"
#include "plasma-api/workspace.hpp"

namespace Bismuth
{

Window::Window(PlasmaApi::Window client, PlasmaApi::Workspace &workspace)
    : m_client(client)
    , m_workspace(workspace)
{
}

bool Window::operator<(const Window &rhs) const
{
    return m_client < m_client;
}

bool Window::operator==(const Window &rhs) const
{
    return m_client == rhs.m_client;
}

void Window::activate()
{
    m_workspace.get().setActiveClient(m_client);
}

QRect Window::geometry() const
{
    return m_client.frameGeometry();
}

void Window::setGeometry(QRect newGeometry)
{
    m_client.setFrameGeometry(newGeometry);
}

void Window::setMode(Mode value)
{
    m_mode = value;
}

Window::Mode Window::mode() const
{
    return m_mode;
}

QString Window::caption() const
{
    return m_client.caption();
}

}
