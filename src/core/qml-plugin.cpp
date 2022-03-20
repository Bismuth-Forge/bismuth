// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "qml-plugin.hpp"

#include <KSharedConfig>

#include <QJSValue>
#include <QString>
#include <QtQml>

#include <memory>

#include "config.hpp"
#include "controller.hpp"
#include "logger.hpp"
#include "plasma-api/plasma-api.hpp"
#include "ts-proxy.hpp"

void CorePlugin::registerTypes(const char *uri)
{
    Q_ASSERT(uri == QLatin1String("org.kde.bismuth.core"));
    qmlRegisterModule(uri, 1, 0);

    qmlRegisterType<Core>(uri, 1, 0, "Core");
}

Core::Core(QQuickItem *parent)
    : QQuickItem(parent)
    , m_engine() // We cannot get engine from the pointer in the constructor
    , m_controller()
    , m_tsProxy()
    , m_config()
    , m_plasmaApi()
{
    // Force check for the config changes
    auto kcfg = KSharedConfig::openConfig("kglobalshortcutsrc");
    kcfg->checkUpdate(QStringLiteral("bismuth-shortcuts-category"), QStringLiteral("bismuth_shortcuts_category.upd"));
}

void Core::init()
{
    m_config = std::make_unique<Bismuth::Config>();
    m_engine = qmlEngine(this);
    qDebug(Bi) << "Core QmlEngine ptr: " << m_engine;
    m_controller = std::make_unique<Bismuth::Controller>();
    m_plasmaApi = std::make_unique<PlasmaApi::PlasmaApi>(m_engine);
    m_tsProxy = std::make_unique<TSProxy>(m_engine, *m_controller, *m_config);
}

TSProxy *Core::tsProxy() const
{
    return m_tsProxy.get();
}
