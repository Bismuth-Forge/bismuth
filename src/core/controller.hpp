// SPDX-FileCopyrightText: 2022 Mikhail Zolotukhin <mail@gikari.com>
// SPDX-License-Identifier: MIT

#pragma once

#include <QAction>
#include <QKeySequence>
#include <QList>

#include <functional>
#include <memory>
#include <vector>

#include "config.hpp"
#include "engine/engine.hpp"
#include "plasma-api/api.hpp"
#include "plasma-api/client.hpp"

class TSProxy;

namespace Bismuth
{

struct Action {
    Action(const QString &id, const QString &description, const QString &defaultKeybinding, std::function<void()> callback);

    QString id;
    QString description;
    QList<QKeySequence> defaultKeybinding;
    std::function<void()> callback;
};

class Controller : public QObject
{
    Q_OBJECT
public:
    Controller(PlasmaApi::Api &, Engine &, const Bismuth::Config &);

    void bindEvents();
    void registerShortcuts();
    void loadExistingWindows();
    void registerAction(const Action &);

    void setProxy(TSProxy *);

public Q_SLOTS:
    void onCurrentSurfaceChanged();
    void onSurfaceUpdate();
    void onClientAdded(PlasmaApi::Client);
    void onClientRemoved(PlasmaApi::Client);
    void onClientMaximized(PlasmaApi::Client);
    void onClientUnmaximized(PlasmaApi::Client);
    void onClientMinimized(PlasmaApi::Client);
    void onClientUnminimized(PlasmaApi::Client);

private:
    std::vector<QAction *> m_registeredShortcuts{};

    PlasmaApi::Api &m_plasmaApi;
    TSProxy *m_proxy;
    Engine &m_engine;
    const Config &m_config;
};

}
