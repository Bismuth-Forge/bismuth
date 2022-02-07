// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@genda.life>
// SPDX-License-Identifier: MIT

#pragma once

#include <QJSValue>
#include <QObject>
#include <QQmlEngine>
#include <QQmlExtensionPlugin>
#include <QQuickItem>

#include <memory>

#include "config.hpp"
#include "plasma-api/plasma-api.hpp"

class CorePlugin : public QQmlExtensionPlugin
{
    Q_OBJECT
    Q_PLUGIN_METADATA(IID QQmlEngineExtensionInterface_iid)

public:
    void registerTypes(const char *uri) override;
};

class Core : public QQuickItem
{
    Q_OBJECT
    QML_ELEMENT

public:
    Core(QQuickItem *parent = nullptr);

    /**
     * Initializes the Core. Acts like a constructor, but bypasses the
     * limitations of one.
     */
    Q_INVOKABLE void init();

    /**
     * Returns the config usable in the legacy TypeScript logic
     */
    Q_INVOKABLE QJSValue jsConfig();

private:
    QQmlEngine *m_engine; ///< Pointer to the engine, that is currently using the Core element

    std::unique_ptr<Bismuth::Config> m_config;
    std::unique_ptr<PlasmaApi::PlasmaApi> m_plasmaApi;
};
