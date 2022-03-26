// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QJSValue>
#include <QObject>
#include <QQmlEngine>
#include <QQmlExtensionPlugin>
#include <QQuickItem>

#include <memory>

#include "config.hpp"
#include "controller.hpp"
#include "engine/engine.hpp"
#include "plasma-api/api.hpp"
#include "ts-proxy.hpp"

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

    Q_PROPERTY(TSProxy *proxy READ tsProxy CONSTANT)

public:
    Core(QQuickItem *parent = nullptr);

    /**
     * Initializes the Core. Acts like a constructor, but bypasses the
     * limitations of one.
     */
    Q_INVOKABLE void init();

    TSProxy *tsProxy() const;

private:
    QQmlEngine *m_qmlEngine; ///< Pointer to the engine, that is currently using the Core element

    std::unique_ptr<Bismuth::Controller> m_controller; ///< Legacy TS Backend proxy
    std::unique_ptr<TSProxy> m_tsProxy; ///< Legacy TS Backend proxy
    std::unique_ptr<Bismuth::Config> m_config;
    std::unique_ptr<PlasmaApi::Api> m_plasmaApi;
    std::unique_ptr<Bismuth::Engine> m_engine;
};
