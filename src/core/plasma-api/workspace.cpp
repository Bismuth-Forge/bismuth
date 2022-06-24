// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "workspace.hpp"

#include <QQmlContext>

#include "logger.hpp"
#include "plasma-api/api.hpp"
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
    auto wrapSimpleSignal = [this](const char *signalSignature) {
        auto signalsSignature = QMetaObject::normalizedSignature(signalSignature);
        connect(m_kwinImpl, signalsSignature, this, signalsSignature);
    };

    auto wrapComplexSignal = [this](const char *implSignalSignature, const char *thisSignalSignature) {
        auto implNormSignature = QMetaObject::normalizedSignature(implSignalSignature);
        auto thisNormSignature = QMetaObject::normalizedSignature(thisSignalSignature);
        connect(m_kwinImpl, implNormSignature, this, thisNormSignature);
    };

    wrapSimpleSignal(SIGNAL(numberScreensChanged(int)));
    wrapSimpleSignal(SIGNAL(screenResized(int)));
    wrapSimpleSignal(SIGNAL(currentActivityChanged(const QString &)));

    wrapComplexSignal(SIGNAL(currentDesktopChanged(int, KWin::Window *)), SLOT(currentDesktopChangedTransformer(int, KWin::Window *)));
    wrapComplexSignal(SIGNAL(clientAdded(KWin::Window *)), SLOT(clientAddedTransformer(KWin::Window *)));
    wrapComplexSignal(SIGNAL(clientRemoved(KWin::Window *)), SLOT(clientRemovedTransformer(KWin::Window *)));
    wrapComplexSignal(SIGNAL(clientMinimized(KWin::Window *)), SLOT(clientMinimizedTransformer(KWin::Window *)));
    wrapComplexSignal(SIGNAL(clientUnminimized(KWin::Window *)), SLOT(clientUnminimizedTransformer(KWin::Window *)));
    wrapComplexSignal(SIGNAL(clientMaximizeSet(KWin::Window *, bool, bool)), SLOT(clientMaximizeSetTransformer(KWin::Window *, bool, bool)));
};

QRect Workspace::clientArea(ClientAreaOption option, int screen, int desktop)
{
    BI_METHOD_IMPL_WRAP(QRect, "clientArea(ClientAreaOption, int, int)", Q_ARG(ClientAreaOption, option), Q_ARG(int, screen), Q_ARG(int, desktop));
};

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

void Workspace::currentDesktopChangedTransformer(int desktop, KWin::Window *kwinClient)
{
    // Since we don't know the KWin internal implementation we have to use reinterpret_cast
    auto clientWrapper = Window(reinterpret_cast<QObject *>(kwinClient));
    Q_EMIT currentDesktopChanged(desktop, clientWrapper);
};

void Workspace::clientAddedTransformer(KWin::Window *kwinClient)
{
    auto clientWrapper = Window(reinterpret_cast<QObject *>(kwinClient));
    Q_EMIT clientAdded(clientWrapper);
}

void Workspace::clientRemovedTransformer(KWin::Window *kwinClient)
{
    auto clientWrapper = Window(reinterpret_cast<QObject *>(kwinClient));
    Q_EMIT clientRemoved(clientWrapper);
}

void Workspace::clientMinimizedTransformer(KWin::Window *kwinClient)
{
    auto clientWrapper = Window(reinterpret_cast<QObject *>(kwinClient));
    Q_EMIT clientMinimized(clientWrapper);
}

void Workspace::clientUnminimizedTransformer(KWin::Window *kwinClient)
{
    auto clientWrapper = Window(reinterpret_cast<QObject *>(kwinClient));
    Q_EMIT clientUnminimized(clientWrapper);
}

void Workspace::clientMaximizeSetTransformer(KWin::Window *kwinClient, bool h, bool v)
{
    auto clientWrapper = Window(reinterpret_cast<QObject *>(kwinClient));
    Q_EMIT clientMaximizeSet(clientWrapper, h, v);
}

}
