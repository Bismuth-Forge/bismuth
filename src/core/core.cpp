// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#include "core.hpp"

#include <KSharedConfig>

#include <QJSValue>
#include <QString>
#include <QtQml>

#include <memory>

#include "config.hpp"

#include "logger.hpp"
#include "plasma-api/api.hpp"

#include "controller.hpp"
#include "engine/engine.hpp"
#include "view.hpp"

#include "kconf_update/legacy-shortcuts.hpp"

void CorePlugin::registerTypes(const char *uri)
{
    Q_ASSERT(uri == QLatin1String("org.kde.bismuth.core"));
    qmlRegisterModule(uri, 1, 0);

    qmlRegisterType<Bismuth::Core>(uri, 1, 0, "Core");
}

namespace Bismuth
{

Core::Core(QQuickItem *parent)
    : QQuickItem(parent)
    , m_qmlEngine() // We cannot get engine from the pointer in the constructor
    , m_controller()
    , m_config()
    , m_plasmaApi()
{
    // Do the necessary migrations, that are not possible from kconf_update
    Bismuth::KConfUpdate::migrate();
}

void Core::init()
{
    m_config = std::make_unique<Bismuth::Config>();
    m_qmlEngine = qmlEngine(this);
    m_plasmaApi = std::make_unique<PlasmaApi::Api>(m_qmlEngine);
    m_view = std::make_unique<Bismuth::View>(m_qmlEngine, qmlContext(this));
    m_engine = std::make_unique<Bismuth::Engine>(*m_plasmaApi, *m_view, *m_config);
    m_controller = std::make_unique<Bismuth::Controller>(*m_plasmaApi, *m_engine, *m_config);
}

}
