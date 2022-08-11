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
#include "plasma-api/window.hpp"

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
    void arrangeWindowsOnAllSurfaces();
    void registerAction(const Action &);

public Q_SLOTS:
    void onCurrentSurfaceChanged();
    void onSurfaceUpdate();
    void onClientAdded(PlasmaApi::Window);
    void onClientRemoved(PlasmaApi::Window);
    void onClientMaximized(PlasmaApi::Window);
    void onClientUnmaximized(PlasmaApi::Window);
    void onClientMinimized(PlasmaApi::Window);
    void onClientUnminimized(PlasmaApi::Window);

private:
    std::vector<QAction *> m_registeredShortcuts{};

    PlasmaApi::Api &m_plasmaApi;
    Engine &m_engine;
    const Config &m_config;
};

}
