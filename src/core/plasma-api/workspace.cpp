// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "workspace.hpp"

#include <QQmlContext>

#include "logger.hpp"
#include "plasma-api/api.hpp"
#include "plasma-api/output.hpp"
#include "plasma-api/virtual-desktop.hpp"
#include "plasma-api/window.hpp"

namespace PlasmaApi
{

Workspace::Workspace(QObject *implPtr)
    : QObject()
    , m_kwinImpl(implPtr)
{
    wrapSignals();
}

Workspace::Workspace(const Workspace &rhs)
    : QObject()
    , m_kwinImpl(rhs.m_kwinImpl)
{
    wrapSignals();
};

std::optional<PlasmaApi::Window> Workspace::activeClient() const
{
    auto kwinClient = m_kwinImpl->property("activeClient").value<QObject *>();
    return kwinClient ? PlasmaApi::Window(kwinClient) : std::optional<PlasmaApi::Window>();
}

void Workspace::setActiveClient(std::optional<PlasmaApi::Window> client)
{
    auto valueToSet = client.has_value() ? client->m_kwinImpl : nullptr;
    m_kwinImpl->setProperty("activeClient", QVariant::fromValue(valueToSet));
}

void Workspace::wrapSignals()
{
    WRAP_SIGNAL(numberScreensChanged(int));
    WRAP_SIGNAL(screenResized(int));
    WRAP_SIGNAL(currentActivityChanged(const QString &));

    WRAP_SIGNAL_WITH_KWIN_TYPE(currentDesktopChanged(int, KWin::Window *));
    WRAP_SIGNAL_WITH_KWIN_TYPE(clientAdded(KWin::Window *));
    WRAP_SIGNAL_WITH_KWIN_TYPE(clientRemoved(KWin::Window *));
    WRAP_SIGNAL_WITH_KWIN_TYPE(clientMinimized(KWin::Window *));
    WRAP_SIGNAL_WITH_KWIN_TYPE(clientUnminimized(KWin::Window *));
    WRAP_SIGNAL_WITH_KWIN_TYPE(clientMaximizeSet(KWin::Window *, bool, bool));
};

QRect Workspace::clientArea(ClientAreaOption option, int screen, int desktop)
{
    BI_METHOD_IMPL_WRAP(QRect, "clientArea(ClientAreaOption, int, int)", Q_ARG(ClientAreaOption, option), Q_ARG(int, screen), Q_ARG(int, desktop));
};

QRect Workspace::clientArea(ClientAreaOption option, PlasmaApi::Output output, PlasmaApi::VirtualDesktop desktop)
{
    BI_METHOD_IMPL_WRAP(QRect,
                        "clientArea(ClientAreaOption, KWin::Output*, KWin::VirtualDesktop*)",
                        Q_ARG(ClientAreaOption, option),
                        Q_ARG(KWin::Output *, reinterpret_cast<KWin::Output *>(output.m_kwinImpl)),
                        Q_ARG(KWin::VirtualDesktop *, reinterpret_cast<KWin::VirtualDesktop *>(desktop.m_kwinImpl)));
}

std::vector<PlasmaApi::Window> Workspace::clientList() const
{
    auto apiCall = [&]() -> QList<KWin::Window *> {
        BI_METHOD_IMPL_WRAP(QList<KWin::Window *>, "clientList()", QGenericArgument(nullptr));
    };

    auto apiCallRes = apiCall();

    auto result = std::vector<PlasmaApi::Window>();
    result.reserve(apiCallRes.size());
    for (auto clientPtr : apiCallRes) {
        if (clientPtr) {
            result.push_back(Window(reinterpret_cast<QObject *>(clientPtr)));
        }
    }

    return result;
}

void Workspace::mapper_currentDesktopChanged(int desktop, KWin::Window *kwinClient)
{
    // Since we don't know the KWin internal implementation we have to use reinterpret_cast
    auto clientWrapper = Window(reinterpret_cast<QObject *>(kwinClient));
    Q_EMIT currentDesktopChanged(desktop, clientWrapper);
};

void Workspace::mapper_clientAdded(KWin::Window *kwinClient)
{
    auto clientWrapper = Window(reinterpret_cast<QObject *>(kwinClient));
    Q_EMIT clientAdded(clientWrapper);
}

void Workspace::mapper_clientRemoved(KWin::Window *kwinClient)
{
    auto clientWrapper = Window(reinterpret_cast<QObject *>(kwinClient));
    Q_EMIT clientRemoved(clientWrapper);
}

void Workspace::mapper_clientMinimized(KWin::Window *kwinClient)
{
    auto clientWrapper = Window(reinterpret_cast<QObject *>(kwinClient));
    Q_EMIT clientMinimized(clientWrapper);
}

void Workspace::mapper_clientUnminimized(KWin::Window *kwinClient)
{
    auto clientWrapper = Window(reinterpret_cast<QObject *>(kwinClient));
    Q_EMIT clientUnminimized(clientWrapper);
}

void Workspace::mapper_clientMaximizeSet(KWin::Window *kwinClient, bool h, bool v)
{
    auto clientWrapper = Window(reinterpret_cast<QObject *>(kwinClient));
    Q_EMIT clientMaximizeSet(clientWrapper, h, v);
}

}
