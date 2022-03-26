// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "engine.hpp"

namespace Bismuth
{
Engine::Engine()
{
}

void Engine::addWindow(PlasmaApi::Client client)
{
    m_windows.add(client);
    // Bind events of this window
}
}
