// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@genda.life>
// SPDX-License-Identifier: MIT

#include "workspace.hpp"

#include <QQmlContext>

#include "logger.hpp"
#include "plasma-api/client.hpp"
#include "plasma-api/plasma-api.hpp"

namespace PlasmaApi
{

Workspace::Workspace(QQmlEngine *engine)
    : QObject()
    , m_engine(engine)
    , m_kwinImpl(m_engine->rootContext()->contextProperty(QStringLiteral("workspace")).value<QObject *>())
{
    wrapSignals();
}

Workspace::Workspace(const Workspace &rhs)
    : QObject()
    , m_engine(rhs.m_engine)
    , m_kwinImpl(rhs.m_kwinImpl)
{
    wrapSignals();
};

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

    wrapComplexSignal(SIGNAL(currentDesktopChanged(int, KWin::AbstractClient *)), SLOT(currentDesktopChangedTransformer(int, KWin::AbstractClient *)));
};

int Workspace::currentDesktop()
{
    return m_kwinImpl->property("currentDesktop").value<int>();
}

void Workspace::setCurrentDesktop(int desktop)
{
    m_kwinImpl->setProperty("currentDesktop", QVariant::fromValue(desktop));
}

void Workspace::currentDesktopChangedTransformer(int desktop, KWin::AbstractClient *kwinClient)
{
    // Since we don't know the KWin internal implementation we have to use reinterpret_cast
    auto clientWrapper = Client(reinterpret_cast<QObject *>(kwinClient));
    Q_EMIT currentDesktopChanged(desktop, clientWrapper);
};

}
